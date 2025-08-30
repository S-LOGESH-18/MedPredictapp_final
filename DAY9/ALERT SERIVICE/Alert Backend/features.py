
from typing import List, Dict
import numpy as np
import pandas as pd
from collections import defaultdict
from dateutil import tz
from .utils import monthly_index, month_floor, safe_merge

UTC = tz.UTC

def build_device_month_frame(event, device, manufacturer):
    # Determine per-device time bounds
    def _min_non_null(row):
        return min([d for d in [row.get("date_posted"), row.get("date_initiated_by_firm")] if pd.notna(d)], default=pd.NaT)

    # Device activity range from events; if no events, use device.updated_at as bounds
    evt_bounds = event.groupby("device_id").agg(
        start=("date_posted", "min"),
        start2=("date_initiated_by_firm", "min"),
        end=("date_updated", "max")
    ).reset_index()
    evt_bounds["start"] = evt_bounds[["start","start2"]].min(axis=1)
    evt_bounds = evt_bounds.drop(columns=["start2"])

    dev_bounds = device[["id","updated_at"]].rename(columns={"id":"device_id"})
    bounds = dev_bounds.merge(evt_bounds, on="device_id", how="left")
    bounds["start"] = bounds["start"].fillna(bounds["updated_at"])
    bounds["end"] = bounds["end"].fillna(bounds["updated_at"])

    # Build monthly index per device
    rows = []
    for _, r in bounds.iterrows():
        idx = monthly_index(r["start"], r["end"])
        for dt in idx:
            rows.append((r["device_id"], dt))
    frame = pd.DataFrame(rows, columns=["device_id","month"])
    frame["month"] = pd.to_datetime(frame["month"], utc=True)

    # Join static device + manufacturer attributes
    static_dev_cols = ["id","classification","risk_class","code","description","implanted","distributed_to","country","manufacturer_id","updated_at","name","number","quantity_in_commerce"]
    dev_static = device[[c for c in static_dev_cols if c in device.columns]].rename(columns={"id":"device_id"})
    frame = frame.merge(dev_static, on="device_id", how="left")

    if "id" in manufacturer.columns:
        man = manufacturer.rename(columns={"id":"manufacturer_id"})
    else:
        man = manufacturer.copy()
    if "created_at" in man.columns:
        man["manufacturer_age_days"] = (frame["month"].min() - man["created_at"].min()).days if man["created_at"].notna().any() else np.nan
    man = man[["manufacturer_id","name","parent_company","representative","address","created_at","updated_at"]].drop_duplicates("manufacturer_id")
    frame = frame.merge(man, on="manufacturer_id", how="left", suffixes=("","_man"))

    # Manufacturer age at month
    if "created_at" in frame.columns:
        frame["manufacturer_age_days"] = (frame["month"] - frame["created_at"]).dt.days

    return frame

def derive_serious_flags(event: pd.DataFrame, mdr: pd.DataFrame, serious_classes: List[str]):
    # Normalize seriousness from event types
    evt = event.copy()
    for c in ["action_classification","type","status","reason","action_summary"]:
        if c in evt.columns:
            evt[c] = evt[c].astype(str).str.lower()

    evt["is_serious"] = False
    if "action_classification" in evt.columns:
        evt["is_serious"] = evt["action_classification"].str.contains("|".join([s.lower() for s in serious_classes]), na=False) | evt["type"].str.contains("fsca|fsqa", na=False)

    # MAUDE serious/death
    mdr_ser = None
    if mdr is not None and len(mdr):
        mdr = mdr.copy()
        for c in mdr.columns:
            if "death" in c or "serious" in c or "injury" in c:
                mdr[c] = mdr[c].astype(str).str.lower()
        # Heuristic: look for columns indicating serious/death
        flag_cols = [c for c in mdr.columns if any(k in c for k in ["death","serious","life_threat","hospital"])]
        mdr["is_serious"] = False
        if flag_cols:
            mdr["is_serious"] = mdr[flag_cols].apply(lambda r: any(str(v) in ["1","true","yes","y","t"] or ("death" in str(v) and "no" not in str(v)) for v in r), axis=1)
        # Standardize link to device_id if present
        guess_dev_col = next((c for c in ["device_id","di","udi","model_number","catalog_number"] if c in mdr.columns), None)
        if guess_dev_col:
            mdr_ser = mdr[[guess_dev_col,"is_serious","date"]].rename(columns={guess_dev_col:"device_id","date":"date_posted"})
            mdr_ser["source"] = "mdr"
    # Combine
    evt["source"] = "event"
    if mdr_ser is not None:
        aligned = pd.concat([evt[["device_id","date_posted","is_serious","source"]], mdr_ser], ignore_index=True)
    else:
        aligned = evt[["device_id","date_posted","is_serious","source"]]
    aligned["date_posted"] = pd.to_datetime(aligned["date_posted"], errors="coerce", utc=True)
    aligned = aligned.dropna(subset=["device_id","date_posted"])
    return aligned

def label_device_months(frame: pd.DataFrame, aligned_events: pd.DataFrame, H_months: int):
    # For each device-month t, label y=1 if serious event occurs in (t, t+H]
    lab = frame[["device_id","month"]].copy()
    lab = lab.merge(aligned_events[["device_id","date_posted","is_serious"]], on="device_id", how="left")
    lab["evt_month"] = lab["date_posted"].dt.to_period("M").dt.to_timestamp(tz=UTC)
    lab["within_h"] = (lab["evt_month"] > lab["month"]) & (lab["evt_month"] <= (lab["month"] + pd.DateOffset(months=H_months)))
    agg = lab.groupby(["device_id","month"])["within_h"].max().reset_index().rename(columns={"within_h":"y"})
    agg["y"] = agg["y"].astype(int)
    return agg

def rolling_features(frame: pd.DataFrame, events: pd.DataFrame, mdr: pd.DataFrame, windows: List[int]):
    # Prepare event time series per device
    events = events.copy()
    events["month"] = events["date_posted"].dt.to_period("M").dt.to_timestamp(tz=UTC)
    events["is_event"] = 1
    events["is_serious"] = events["is_serious"].astype(int)

    ts = events.groupby(["device_id","month"]).agg(
        evt_cnt=("is_event","sum"),
        serious_cnt=("is_serious","sum")
    ).reset_index()

    # MDR counts if available
    mdr_ts = None
    if mdr is not None and len(mdr):
        mdr = mdr.copy()
        if "date" in mdr.columns:
            mdr["month"] = pd.to_datetime(mdr["date"], errors="coerce", utc=True).dt.to_period("M").dt.to_timestamp(tz=UTC)
            mdr["mdr_cnt"] = 1
            mdr_ts = mdr.groupby(["device_id","month"])["mdr_cnt"].sum().reset_index()

    base = frame[["device_id","month"]].copy()
    full = base.merge(ts, on=["device_id","month"], how="left").merge(mdr_ts, on=["device_id","month"], how="left") if mdr_ts is not None else base.merge(ts, on=["device_id","month"], how="left")
    full = full.fillna({"evt_cnt":0,"serious_cnt":0,"mdr_cnt":0})

    # Rolling windows
    def add_roll(df, col, w):
        df = df.sort_values(["device_id","month"]).copy()
        df[f"{col}_roll_{w}m"] = df.groupby("device_id")[col].transform(lambda s: s.rolling(window=w, min_periods=1).sum())
        return df

    # Convert to monthly integer windows (right-closed)
    # Since we are on a monthly grid, rolling(window=w) over months is right-closed by default for past months.
    for w in windows:
        for col in ["evt_cnt","serious_cnt","mdr_cnt"]:
            if col in full.columns:
                full = add_roll(full, col, w)

    # Severe ratio
    for w in windows:
        a = f"serious_cnt_roll_{w}m"
        b = f"evt_cnt_roll_{w}m"
        if a in full.columns and b in full.columns:
            full[f"severe_ratio_{w}m"] = np.where(full[b]>0, full[a]/full[b], 0.0)

    # time since last event
    full = full.sort_values(["device_id","month"])
    full["last_evt_month"] = full.groupby("device_id")["month"].shift(1).where(full["evt_cnt"].gt(0))
    full["last_evt_month"] = full.groupby("device_id")["last_evt_month"].ffill()
    full["time_since_last_event_days"] = (full["month"] - full["last_evt_month"]).dt.days.fillna(9999)

    return full

def add_static_and_manufacturer(frame: pd.DataFrame):
    # Static categorical/numeric
    frame = frame.copy()
    # ensure binary for 'implanted'
    if "implanted" in frame.columns:
        frame["implanted"] = frame["implanted"].astype(str).str.lower().isin(["1","true","yes","y","t"]).astype(int)
    # manufacturer age days already computed in build_device_month_frame
    return frame

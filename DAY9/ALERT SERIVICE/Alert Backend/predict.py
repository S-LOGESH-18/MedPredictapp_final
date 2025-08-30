
import os, joblib, numpy as np, pandas as pd
from dateutil import tz
from .features import build_device_month_frame, derive_serious_flags, label_device_months, rolling_features, add_static_and_manufacturer
from .text_feats import compute_embeddings, keyword_flags

UTC = tz.UTC

def predict_next_horizon(dev_df, evt_df, man_df, asof_date, H=6, artifacts_dir="./outputs"):
    """Return ranked DataFrame for the month containing `asof_date`."""
    preproc = joblib.load(os.path.join(artifacts_dir, "preproc.pkl"))
    model = joblib.load(os.path.join(artifacts_dir, "model.bin"))
    calibrator = joblib.load(os.path.join(artifacts_dir, "calibrator.pkl")) if os.path.exists(os.path.join(artifacts_dir, "calibrator.pkl")) else None
    feats_spec = preproc["features"]
    cfg = preproc["config"]

    # Build a single-month frame for as-of
    evt_df = evt_df.copy()
    dev_df = dev_df.copy()
    man_df = man_df.copy()

    # Force UTC and snake_case assumed already
    frame = build_device_month_frame(evt_df, dev_df, man_df)
    asof_month = pd.to_datetime(asof_date, utc=True).to_period("M").to_timestamp(tz=UTC)
    frame = frame[frame["month"] == asof_month]

    aligned = derive_serious_flags(evt_df, None, cfg["serious_classes"])
    roll = rolling_features(frame, aligned, None, cfg["windows_months"])
    feats = add_static_and_manufacturer(frame)

    dev_desc = dev_df[["id","description"]].rename(columns={"id":"device_id","description":"device_desc"})
    feats = feats.merge(dev_desc, on="device_id", how="left")
    emb = compute_embeddings(feats["device_desc"], cfg["embedding_model"])
    emb_df = pd.DataFrame(emb, index=feats.index, columns=[f"emb_{i:03d}" for i in range(emb.shape[1])])
    kw = keyword_flags(feats, ["device_desc"], cfg["keywords"])

    X = feats.join(roll.set_index(["device_id","month"]), on=["device_id","month"]).join(emb_df).join(kw)
    X = X.reindex(columns=feats_spec, fill_value=0)

    p = model.predict_proba(X)[:,1]
    if calibrator is not None:
        p = calibrator.transform(p)

    out = X[[]].copy()
    out["device_id"] = feats["device_id"].values
    out["score"] = p
    out["valid_for_month"] = asof_month.strftime("%Y-%m")
    out = out.sort_values("score", ascending=False).reset_index(drop=True)
    return out

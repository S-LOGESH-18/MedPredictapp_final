"""
Device Recall Predictor
-----------------------
Train three models from your COMPANY / DEVICE / EVENTS tables to:
  1) Predict probability of a NEXT recall for a device within a horizon (default 180 days)
  2) If a recall occurs, predict the most likely recall class (I / II / III)
  3) For a recall event, predict whether it will be Terminated vs Ongoing

Usage:
  predictor = DeviceRecallPredictor(horizon_days=180)
  predictor.fit(events_df, devices_df, companies_df=None)
  result = predictor.predict_device(12710, events_df, devices_df)
  predictor.save("recall_model.pkl")
  predictor = DeviceRecallPredictor.load("recall_model.pkl")

Author: ChatGPT
"""

from __future__ import annotations
import warnings
warnings.filterwarnings("ignore")

from dataclasses import dataclass
from typing import Optional, Dict, Any, Tuple

import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
import joblib


# ----------------------------
# Helpers
# ----------------------------

def _std_cols(df: pd.DataFrame) -> pd.DataFrame:
    """Standardize column names (uppercase)."""
    df = df.copy()
    df.columns = [str(c).strip().upper() for c in df.columns]
    return df

def _parse_dates(df: pd.DataFrame, cols) -> pd.DataFrame:
    """Convert specified columns to datetime."""
    df = df.copy()
    for c in cols:
        if c in df.columns:
            df[c] = pd.to_datetime(df[c], errors="coerce", dayfirst=True)
    return df

def _coalesce_date_row(row: pd.Series) -> pd.Timestamp:
    """Choose first valid date from updated, posted, initiated."""
    for c in ("DATE_UPDATED", "DATE_POSTED", "DATE_INITIATED_BY_FIRM"):
        if pd.notnull(row.get(c)):
            return row[c]
    return pd.NaT


# ----------------------------
# Feature Engineering
# ----------------------------

def make_event_frame(events: pd.DataFrame, devices: pd.DataFrame) -> pd.DataFrame:
    """Merge EVENTS and DEVICES and engineer historical features."""
    e = _std_cols(events)
    d = _std_cols(devices)

    # Date handling
    date_cols = ["DATE_INITIATED_BY_FIRM", "DATE_POSTED", "DATE_TERMINATED", "DATE_UPDATED"]
    e = _parse_dates(e, date_cols)

    if "DEVICE_ID" not in e.columns or "ID" not in d.columns:
        raise ValueError("EVENTS must include DEVICE_ID and DEVICE must include ID")

    # Select device features
    d_small = d[[
        "ID", "RISK_CLASS", "CLASSIFICATION", "IMPLANTED", "COUNTRY",
        "QUANTITY_IN_COMMERCE", "DESCRIPTION"
    ]].rename(columns={"ID": "DEVICE_ID", "DESCRIPTION": "DEVICE_DESCRIPTION"})

    df = e.merge(d_small, on="DEVICE_ID", how="left")

    # Derived time features
    df["EVENT_DATE"] = df.apply(_coalesce_date_row, axis=1)
    df["DAYS_TO_POSTED"] = (df["DATE_POSTED"] - df["DATE_INITIATED_BY_FIRM"]).dt.days
    df["DAYS_TO_TERMINATED"] = (df["DATE_TERMINATED"] - df["DATE_POSTED"]).dt.days
    df["DAYS_SINCE_UPDATE"] = (df["DATE_UPDATED"].max() - df["DATE_UPDATED"]).dt.days

    # Implanted flag
    df["IS_IMPLANTED"] = (
        df.get("IMPLANTED").astype(str).str.upper().isin(["1", "YES", "TRUE", "Y"]).astype(int)
    )

    # Normalize class/type
    df["TYPE"] = df.get("TYPE").astype(str).str.strip()
    df["ACTION_CLASSIFICATION"] = (
        df.get("ACTION_CLASSIFICATION")
        .astype(str)
        .str.replace("CLASS ", "", regex=False)
        .str.strip()
        .str.upper()
    )

    df = df.sort_values(["DEVICE_ID", "EVENT_DATE"]).reset_index(drop=True)

    # Historical counts
    for t in ["Recall", "Safety Alert"]:
        flag = (df["TYPE"].str.lower() == t.lower()).astype(int)
        df[f"HIST_{t.replace(' ', '_').upper()}_COUNT"] = (
            flag.groupby(df["DEVICE_ID"]).cumsum().shift(1).fillna(0)
        )

    for rc in ["I", "II", "III"]:
        flag = (df["ACTION_CLASSIFICATION"].str.upper() == rc).astype(int)
        df[f"HIST_CLASS_{rc}_COUNT"] = (
            flag.groupby(df["DEVICE_ID"]).cumsum().shift(1).fillna(0)
        )

    # Time since last event
    last_event_date = df.groupby("DEVICE_ID")["EVENT_DATE"].shift(1)
    df["DAYS_SINCE_LAST_EVENT"] = (df["EVENT_DATE"] - last_event_date).dt.days

    # Ensure numeric
    for c in ["QUANTITY_IN_COMMERCE", "RISK_CLASS"]:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce")

    return df


def add_future_labels(df: pd.DataFrame, horizon_days: int = 180) -> pd.DataFrame:
    """Create future-looking labels for next recall, recall class, and status."""
    df = df.copy().sort_values(["DEVICE_ID", "EVENT_DATE"]).reset_index(drop=True)

    # Recall events
    recalls = df[df["TYPE"].str.lower() == "recall"][["DEVICE_ID", "EVENT_DATE", "ACTION_CLASSIFICATION"]]
    recalls = recalls.rename(columns={"EVENT_DATE": "NEXT_RECALL_DATE", "ACTION_CLASSIFICATION": "NEXT_RECALL_CLASS"})
    recalls = recalls.sort_values(["DEVICE_ID", "NEXT_RECALL_DATE"])

    labeled = pd.merge_asof(
        df.sort_values(["DEVICE_ID", "EVENT_DATE"]),
        recalls,
        by="DEVICE_ID",
        left_on="EVENT_DATE",
        right_on="NEXT_RECALL_DATE",
        direction="forward",
        tolerance=pd.Timedelta(days=horizon_days),
    )

    # Label: recall within horizon
    labeled["Y_NEXT_RECALL"] = labeled["NEXT_RECALL_DATE"].notna().astype(int)
    labeled.loc[~labeled["NEXT_RECALL_CLASS"].isin(["I", "II", "III"]), "NEXT_RECALL_CLASS"] = np.nan

    # Label: status if recall
    labeled["Y_STATUS_TERMINATED"] = np.where(
        (labeled["TYPE"].str.lower() == "recall") &
        (labeled.get("STATUS").astype(str).str.strip().str.lower() == "terminated"),
        1,
        np.where(labeled["TYPE"].str.lower() == "recall", 0, np.nan),
    )
    return labeled


# ----------------------------
# Main Model
# ----------------------------

@dataclass
class DeviceRecallPredictor:
    horizon_days: int = 180
    random_state: int = 42
    text_max_features: int = 600

    next_recall_pipe: Optional[Pipeline] = None
    class_pipe: Optional[Pipeline] = None
    status_pipe: Optional[Pipeline] = None
    _feature_cols_: Optional[Dict[str, Any]] = None

    def _build_column_transformer(self, df: pd.DataFrame) -> Tuple[ColumnTransformer, Dict[str, Any]]:
        """Build preprocessing transformer."""
        numeric_cols = [c for c in [
            "DAYS_TO_POSTED","DAYS_TO_TERMINATED","DAYS_SINCE_UPDATE",
            "DAYS_SINCE_LAST_EVENT","QUANTITY_IN_COMMERCE","RISK_CLASS",
            "HIST_RECALL_COUNT","HIST_SAFETY_ALERT_COUNT",
            "HIST_CLASS_I_COUNT","HIST_CLASS_II_COUNT","HIST_CLASS_III_COUNT"
        ] if c in df.columns]

        cat_cols = [c for c in ["TYPE","ACTION","ACTION_CLASSIFICATION","STATUS","CLASSIFICATION","COUNTRY","IS_IMPLANTED"] if c in df.columns]

        # Combined text field
        df["TEXT_ALL"] = (
            df.get("ACTION_SUMMARY", "").astype(str) + " " +
            df.get("REASON", "").astype(str) + " " +
            df.get("DEVICE_DESCRIPTION", "").astype(str)
        )
        text_col = "TEXT_ALL"

        numeric_transformer = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler(with_mean=False))
        ])
        cat_transformer = Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse=True))
        ])
        text_transformer = Pipeline([
            ("tfidf", TfidfVectorizer(max_features=self.text_max_features, ngram_range=(1,2)))
        ])

        pre = ColumnTransformer([
            ("num", numeric_transformer, numeric_cols),
            ("cat", cat_transformer, cat_cols),
            ("txt", text_transformer, text_col),
        ], remainder="drop", sparse_threshold=0.3)

        return pre, {"numeric": numeric_cols, "categorical": cat_cols, "text": text_col}

    def fit(self, events: pd.DataFrame, devices: pd.DataFrame, companies: Optional[pd.DataFrame] = None) -> "DeviceRecallPredictor":
        """Train all models."""
        base = make_event_frame(events, devices)
        data = add_future_labels(base, horizon_days=self.horizon_days)
        pre, cols = self._build_column_transformer(data)
        self._feature_cols_ = cols

        # 1. Next Recall
        y1 = data["Y_NEXT_RECALL"].astype(int)
        X1_train, X1_test, y1_train, y1_test = train_test_split(data, y1, test_size=0.2, random_state=self.random_state, stratify=y1)
        self.next_recall_pipe = Pipeline([("pre", pre), ("clf", LogisticRegression(max_iter=200, class_weight="balanced"))])
        self.next_recall_pipe.fit(X1_train, y1_train)
        print("[Next Recall] AUC:", roc_auc_score(y1_test, self.next_recall_pipe.predict_proba(X1_test)[:,1]))

        # 2. Recall Class
        mask_class = data["NEXT_RECALL_CLASS"].notna()
        if mask_class.sum() >= 10:
            X2, y2 = data.loc[mask_class], data.loc[mask_class, "NEXT_RECALL_CLASS"].astype(str)
            X2_train, X2_test, y2_train, y2_test = train_test_split(X2, y2, test_size=0.2, random_state=self.random_state, stratify=y2)
            self.class_pipe = Pipeline([("pre", pre), ("clf", LogisticRegression(max_iter=300, multi_class="auto", class_weight="balanced"))])
            self.class_pipe.fit(X2_train, y2_train)
            print("[Recall Class] F1:", f1_score(y2_test, self.class_pipe.predict(X2_test), average="weighted"))
        else:
            print("[Recall Class] Skipped (not enough samples)")

        # 3. Status
        mask_status = data["Y_STATUS_TERMINATED"].notna()
        if mask_status.sum() >= 10:
            X3, y3 = data.loc[mask_status], data.loc[mask_status, "Y_STATUS_TERMINATED"].astype(int)
            X3_train, X3_test, y3_train, y3_test = train_test_split(X3, y3, test_size=0.2, random_state=self.random_state, stratify=y3)
            self.status_pipe = Pipeline([("pre", pre), ("clf", LogisticRegression(max_iter=200, class_weight="balanced"))])
            self.status_pipe.fit(X3_train, y3_train)
            print("[Status] AUC:", roc_auc_score(y3_test, self.status_pipe.predict_proba(X3_test)[:,1]))
        else:
            print("[Status] Skipped (not enough samples)")

        return self

    def _last_event_row(self, device_id: Any, events: pd.DataFrame, devices: pd.DataFrame) -> pd.DataFrame:
        """Return the most recent event row for a device."""
        base = make_event_frame(events, devices)
        one = base[base["DEVICE_ID"] == device_id].sort_values("EVENT_DATE").tail(1)
        if one.empty:
            raise ValueError(f"No events found for device_id={device_id}")
        return one

    def predict_device(self, device_id: Any, events: pd.DataFrame, devices: pd.DataFrame) -> Dict[str, Any]:
        """Predict recall risks for a given device."""
        row = self._last_event_row(device_id, events, devices)
        res: Dict[str, Any] = {"device_id": device_id}

        # 1. Next recall
        if self.next_recall_pipe:
            proba = float(self.next_recall_pipe.predict_proba(row)[0, 1])
            res.update({
                "p_next_recall_within_horizon": proba,
                "next_recall_pred": int(proba >= 0.5),
                "horizon_days": self.horizon_days
            })

        # 2. Recall class
        if self.class_pipe:
            try:
                class_proba = self.class_pipe.predict_proba(row)[0]
                classes = list(self.class_pipe.classes_)
                res["recall_class_probs"] = dict(zip(classes, map(float, class_proba)))
                res["recall_class_pred"] = classes[int(np.argmax(class_proba))]
            except Exception:
                pass

        # 3. Recall status
        if self.status_pipe and row["TYPE"].astype(str).str.lower().iloc[0] == "recall":
            st_proba = float(self.status_pipe.predict_proba(row)[0, 1])
            res.update({
                "p_terminated_if_recall": st_proba,
                "status_pred": "Terminated" if st_proba >= 0.5 else "Ongoing"
            })

        return res

    def save(self, path: str) -> None:
        """Save trained model to disk."""
        joblib.dump({
            "horizon_days": self.horizon_days,
            "random_state": self.random_state,
            "text_max_features": self.text_max_features,
            "next_recall_pipe": self.next_recall_pipe,
            "class_pipe": self.class_pipe,
            "status_pipe": self.status_pipe,
            "feature_cols": self._feature_cols_,
        }, path)

    @staticmethod
    def load(path: str) -> "DeviceRecallPredictor":
        """Load model from disk."""
        blob = joblib.load(path)
        obj = DeviceRecallPredictor(
            blob.get("horizon_days", 180),
            blob.get("random_state", 42),
            blob.get("text_max_features", 600)
        )
        obj.next_recall_pipe = blob.get("next_recall_pipe")
        obj.class_pipe = blob.get("class_pipe")
        obj.status_pipe = blob.get("status_pipe")
        obj._feature_cols_ = blob.get("feature_cols")
        return obj

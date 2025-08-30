
import re
import logging
from contextlib import contextmanager
from time import perf_counter
import numpy as np
import pandas as pd
from dateutil import parser, tz

UTC = tz.UTC

def to_snake(name: str) -> str:
    s = re.sub(r'[\s\-\/]+', '_', name.strip())
    s = re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', s)
    s = s.replace("__", "_")
    return s.lower()

def standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [to_snake(c) for c in df.columns]
    return df

def parse_dates_safe(df: pd.DataFrame, date_cols):
    df = df.copy()
    for c in date_cols:
        if c in df.columns:
            df[c] = pd.to_datetime(df[c], errors="coerce", utc=True, infer_datetime_format=True)
    return df

def coerce_numeric(df: pd.DataFrame, cols):
    df = df.copy()
    for c in cols:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce")
    return df

def ensure_datetime(s):
    return pd.to_datetime(s, errors="coerce", utc=True)

@contextmanager
def log_timing(step: str):
    logging.info(f"[START] {step}")
    t0 = perf_counter()
    yield
    dt = perf_counter() - t0
    logging.info(f"[DONE]  {step} in {dt:.2f}s")

def monthly_index(start, end):
    if pd.isna(start) or pd.isna(end):
        return pd.DatetimeIndex([], tz=UTC)
    s = pd.Timestamp(start, tz=UTC) - pd.offsets.MonthBegin(0)
    e = pd.Timestamp(end, tz=UTC) + pd.offsets.MonthEnd(0)
    return pd.date_range(s.normalize(), e.normalize(), freq="MS", tz=UTC)

def right_closed_rolling(series: pd.Series, window_months: int):
    """Right-closed window: counts for events strictly before or at t, not after.
    Implemented by resampling to daily and using a time-based rolling window.
    """
    if series.empty:
        return series
    ts = series.sort_index().asfreq("D", fill_value=0)
    roll = ts.rolling(f"{window_months}M", closed="right").sum()
    return roll

def month_floor(ts):
    return pd.Timestamp(ts).to_period("M").to_timestamp(tz=UTC)

def year_from_ts(ts):
    return pd.Timestamp(ts, tz=UTC).year

def safe_merge(a: pd.DataFrame, b: pd.DataFrame, on, how="left"):
    return a.merge(b, on=on, how=how, validate="m:1")

def hash_top_features(shap_values, feature_names, topn=5):
    import numpy as np
    vals = np.abs(shap_values).mean(axis=0)
    idx = np.argsort(vals)[::-1][:topn]
    return [feature_names[i] for i in idx]


import os
import glob
import pandas as pd
import numpy as np
from .utils import standardize_columns, parse_dates_safe

READ_KW = dict(dtype=str, low_memory=False)

def _read_any(path):
    if path.endswith(".parquet"):
        return pd.read_parquet(path)
    return pd.read_csv(path, **READ_KW)

def read_first_match(pattern: str):
    files = sorted(glob.glob(pattern))
    if not files:
        return None
    return _read_any(files[0])

def ingest_all(data_dir: str, date_cols):
    out = {}
    # Core tables
    event = read_first_match(os.path.join(data_dir, "event.*"))
    device = read_first_match(os.path.join(data_dir, "device.*"))
    manufacturer = read_first_match(os.path.join(data_dir, "manufacturer.*"))

    for name, df in (("event", event), ("device", device), ("manufacturer", manufacturer)):
        if df is not None:
            df = standardize_columns(df)
            df = parse_dates_safe(df, date_cols)
        out[name] = df

    # Optional
    res = read_first_match(os.path.join(data_dir, "res.csv"))
    gudid = read_first_match(os.path.join(data_dir, "gudid.csv"))
    out["res"] = standardize_columns(res) if res is not None else None
    out["gudid"] = standardize_columns(gudid) if gudid is not None else None

    # MAUDE (potentially huge) — stream combine
    mdr_files = sorted(glob.glob(os.path.join(data_dir, "mdr*.csv")))
    if mdr_files:
        chunks = []
        for f in mdr_files:
            for ch in pd.read_csv(f, **READ_KW, chunksize=200_000):
                ch = standardize_columns(ch)
                ch = parse_dates_safe(ch, date_cols)
                chunks.append(ch)
        out["mdr"] = pd.concat(chunks, ignore_index=True) if chunks else None
    else:
        out["mdr"] = None

    return out

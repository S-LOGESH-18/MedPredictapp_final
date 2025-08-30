import random
import re
from datetime import datetime, timedelta
from typing import Optional, Tuple

import pandas as pd

DEFAULT_N_ROWS = 5000
INPUT_CSV = "Original dataset/manufacturer.csv"  

def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

def random_date(start: datetime, end: datetime) -> datetime:
    """Return a random datetime between start and end."""
    delta = end - start
    return start + timedelta(seconds=random.randint(0, int(delta.total_seconds())))

def make_timestamps() -> Tuple[str, str]:
    created = random_date(datetime(2010, 1, 1), datetime(2025, 1, 1))
    updated = created + timedelta(days=random.randint(0, 365 * 2))
    return created.isoformat(), updated.isoformat()

def _norm_ws(txt: str) -> str:
    return re.sub(r"\s+", " ", txt.strip())

SEED_ROWS = [
    {
        "name": "Zimmer Group",
        "address": "Germany",
        "comment": "Zimmer Group is one of the world’s leading specialists in automation technology.",
        "parent_company": "Zimmer GmbH",
        "representative": "Martin Zimmer",
        "source": "User-supplied seed",
    },
    {
        "name": "Medtronic Group",
        "address": "USA",
        "comment": "Medtronic is the world’s largest medical technology company.",
        "parent_company": "Medtronic plc",
        "representative": "Geoff Martha",
        "source": "User-supplied seed",
    },
    {
        "name": "Abbott Group",
        "address": "USA",
        "comment": "Abbott is a global healthcare leader that helps people live more fully.",
        "parent_company": "Abbott Laboratories",
        "representative": "Robert Ford",
        "source": "User-supplied seed",
    },
    {
        "name": "Boston Scientific Group",
        "address": "USA",
        "comment": "Boston Scientific is dedicated to transforming lives through innovative medical solutions.",
        "parent_company": "Boston Scientific Corporation",
        "representative": "Michael F. Mahoney",
        "source": "User-supplied seed",
    },
]

def load_input_csv(path: str) -> pd.DataFrame:
    try:
        df = pd.read_csv(path)
        print(f"📥 Loaded {len(df)} rows from {path}")
        return df
    except FileNotFoundError:
        print(f"⚠️ No input CSV found at {path}, using only embedded seeds.")
        return pd.DataFrame()

def build_seed_frame() -> pd.DataFrame:
    rows = []
    # hardcoded seed rows
    for i, r in enumerate(SEED_ROWS, start=1):
        created_at, updated_at = make_timestamps()
        rows.append({
            "id": i,
            "address": r["address"],
            "comment": _norm_ws(r["comment"]),
            "name": r["name"],
            "parent_company": r["parent_company"],
            "representative": r["representative"],
            "slug": slugify(r["name"]),
            "source": r.get("source", "seed"),
            "created_at": created_at,
            "updated_at": updated_at,
        })
    seed_df = pd.DataFrame(rows)

    # append input CSV rows (if any)
    input_df = load_input_csv(INPUT_CSV)
    if not input_df.empty:
        # assign missing fields if not present
        for col in ["id","address","comment","name","parent_company",
                    "representative","slug","source","created_at","updated_at"]:
            if col not in input_df.columns:
                input_df[col] = None
        seed_df = pd.concat([seed_df, input_df], ignore_index=True)

    return seed_df

# -------------------------------------------------------------
# Synthetic generator
# -------------------------------------------------------------
NAMES = ["Novocare", "HealthPlus", "MediLife", "BioFuture", "CareTech", "NeuroSys"]
ADDRESSES = ["USA", "Germany", "India", "Japan", "UK", "France", "China", "Brazil"]
COMMENTS = [
    "Global leader in medical device innovation.",
    "Specializes in life-saving implants.",
    "Focused on patient-centric healthcare solutions.",
    "Pioneering minimally invasive surgical tools.",
    "Committed to affordable healthcare worldwide.",
]
REPRESENTATIVES = ["Alice Johnson", "Rajesh Kumar", "Hiro Tanaka", "Laura Schmidt", "Carlos Mendes"]

def make_fake_row(i: int) -> dict:
    name = random.choice(NAMES) + " Group"
    created_at, updated_at = make_timestamps()
    return {
        "id": i,
        "address": random.choice(ADDRESSES),
        "comment": random.choice(COMMENTS),
        "name": name,
        "parent_company": name.replace(" Group", " Inc"),
        "representative": random.choice(REPRESENTATIVES),
        "slug": slugify(name),
        "source": "synthetic",
        "created_at": created_at,
        "updated_at": updated_at,
    }

# -------------------------------------------------------------
# Main
# -------------------------------------------------------------
def main(n_rows: int = DEFAULT_N_ROWS, output_csv: str = "manufacturers_synthetic.csv"):
    seed_df = build_seed_frame()
    rows = list(seed_df.to_dict(orient="records"))
    next_id = len(rows) + 1

    while len(rows) < n_rows:
        rows.append(make_fake_row(next_id))
        next_id += 1

    df = pd.DataFrame(rows)
    df.to_csv(output_csv, index=False)

    print("-------------------------------------------------")
    print(f"📥 Input CSV (optional): {INPUT_CSV}")
    print(f"🌱 Embedded seed rows: {len(SEED_ROWS)}")
    print(f"📊 Final dataset rows: {len(df)}")
    print(f"✅ Output CSV written: {output_csv}")
    print("-------------------------------------------------")
    print(df.head())

if __name__ == "__main__":
    main()

import random
import re
from datetime import datetime, timedelta
from typing import Optional, Tuple

import pandas as pd

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except Exception:
    SKLEARN_AVAILABLE = False

RNG_SEED = 42
DEFAULT_N_ROWS = 100000
DEVICE_CSV = r"D:/CTS Hackathon/Original dataset/devicepreprocessed.csv"
MANUFACTURER_CSV = r"D:/CTS Hackathon/Original dataset/manufacturer.csv"
OUTPUT_CSV = "100000_rows.csv"


MANUFACTURER_ID_MIN = 1
MANUFACTURER_ID_MAX = 31827  # inclusive

START_DATE = datetime(2010, 1, 1)
END_DATE = datetime(2024, 12, 31)

MISSING_ACTION_FRAC = 0.20
MISSING_REASON_FRAC = 0.10
MISSING_SUMMARY_FRAC = 0.15

random.seed(RNG_SEED)

REASONS_POOL = [
    "Customers instructed to stop use and return affected lots due to contamination risk.",
    "Quarantine and return affected stock to distributor due to potential vacuum leak.",
    "Mandatory removal of devices from hospitals; risk of electric shock under certain conditions.",
    "Device packaging sterility compromised; remove from inventory and return for replacement.",
    "Battery defect may cause sudden power loss; users told to cease use and arrange recall.",
    "Instructions for Use updated: do not adjust chair while occupied; add pre-use safety checks.",
    "Software anomaly may lead to incorrect dose calculation after prescription change; patch available.",
    "Incorrect labelling of external packaging; description does not match device type.",
    "Shelf life reduced by 9 months pending stability data.",
    "Measured work time differs from IFU; IFU is being corrected.",
    "Potential cutter fracture in dense bone; indication clarified in directions for use.",
    "Increased rate of false positives; specificity claim not met for certain reagent lots.",
    "System may fail to detect empty wash bottle leading to erroneous results; service bulletin issued.",
    "Door safety update to reduce exposure to hot water/steam; design enhancement planned.",
    "Paper pouch seal integrity may be inadequate; sterility of outer surface may be compromised.",
    "Screw shank may separate from polyaxial head under high torque; alternate fixation advised.",
    "Carabiner wear may lead to unhooking; inspection and replacement guidance provided.",
    "User interface may freeze during diagnostic ECG preview; firmware update released.",
    "Field Safety Notice: advisory to distributors and hospitals about oxygen consumption miscalculation.",
    "Advisory notice on image rotation markers; software 3.0.4 to be installed by service.",
    "Customer letter regarding rack lifetime; possible slide fall-out, repeat staining may be needed.",
    "Communication to laboratories about biased lactate results; monitoring and recalibration guidance.",
]

SUMMARIES_POOL = [
    "Device recalled due to contamination risk.",
    "Field correction issued for software dose calculation anomaly.",
    "Labeling correction and updated IFU provided to users.",
    "Advisory notice to hospitals regarding maintenance and inspection.",
    "Quarantine and return affected stock to supplier.",
    "Shelf-life reduction pending additional stability data.",
    "Packaging seal integrity concern; product retrieval initiated.",
    "Potential for false results; temporary mitigation and re-calibration guidance.",
]

ACTION_PROTOTYPES = {
    "Recall": "remove return destroy stop use cease use quarantine withdraw retrieve disposal recall mandatory product removal",
    "Safety Alert": "incorrect labeling IFU DFU instructions malfunction software bug anomaly update correction field correction product correction warning alert dose calculation monitoring units",
    "FSN": "field safety notice field action advisory notice communication customer letter distributor hospital notification advisory",
}

CLASS_KEYWORDS = {
    "Class I": [
        "death", "life-threatening", "electric shock", "shock hazard", "fire",
        "overdose", "over infusion", "oxygen", "ventilator", "incorrect dose",
        "radiation", "severe injury", "unrestricted flow", "cardiac",
    ],
    "Class II": [
        "false positive", "false negative", "inaccurate", "imprecision",
        "sterility", "packaging", "software freeze", "malfunction",
        "label", "labelling", "labeling", "if u", "ifu", "dfu",
    ],
    "Class III": [
        "typo", "documentation", "work time", "warning label", "administrative",
        "clarification", "advisory", "communication",
    ],
}

_norm = lambda s: re.sub(r"\s+", " ", (s or "").strip()).lower()


def _contains_any(text: str, keywords) -> bool:
    t = _norm(text)
    return any(k in t for k in keywords)


def classify_action(reason: Optional[str], summary: Optional[str], action_existing: Optional[str]) -> str:
    """Infer 'action' using keyword rules, then TF-IDF similarity fallback.
    Priority: explicit keywords > TF-IDF > existing value > default 'Safety Alert'.
    """
    reason = reason or ""
    summary = summary or ""
    combined = f"{reason} {summary}"
    
    recall_kw = ["remove", "return", "destroy", "stop use", "cease use", "quarantine", "withdraw", "recall", "retrieve", "dispose"]
    fsn_kw = ["field safety notice", "field action", "advisory notice", "customer letter", "communication to", "distributor", "hospital"]
    corr_kw = ["incorrect label", "label", "labelling", "labeling", "ifu", "dfu", "instructions", "malfunction", "software", "bug", "anomaly", "update", "correction", "product correction", "field correction", "warning", "alert", "dose", "monitor units"]

    combo = _norm(combined)

    if _contains_any(combo, recall_kw):
        return "Recall"
    if _contains_any(combo, fsn_kw):
        return "FSN"
    if _contains_any(combo, corr_kw):
        return "Safety Alert"

    if SKLEARN_AVAILABLE and combined.strip():
        texts = [combined] + list(ACTION_PROTOTYPES.values())
        vec = TfidfVectorizer(ngram_range=(1, 2), min_df=1).fit_transform(texts)
        sims = cosine_similarity(vec[0:1], vec[1:]).flatten()
        labels = list(ACTION_PROTOTYPES.keys())
        best = labels[int(sims.argmax())]
        return best

    # Rule 3: keep existing if provided, else default
    if action_existing in {"Recall", "FSN", "Safety Alert"}:
        return action_existing
    return "Safety Alert"


def generate_summary(action: Optional[str], reason: Optional[str]) -> str:
    reason = (reason or "").strip()
    if not reason:
        # generic summary by action
        base = {
            "Recall": "Device recalled due to potential risk.",
            "FSN": "Field Safety Notice issued to inform users.",
            "Safety Alert": "Safety alert / correction communicated to users.",
        }.get(action or "Safety Alert", "Safety alert communicated to users.")
        return base

    # compress reason to a short summary (first clause + action verb)
    short = re.split(r"[.;]", reason)[0]
    short = re.sub(r"^(instructions for use|ifu|dfu)\s*[:\-]\s*", "", short, flags=re.I)

    # map to clean template
    if action == "Recall":
        return f"Device recalled: {short.strip()}"[:180]
    if action == "FSN":
        return f"Field Safety Notice: {short.strip()}"[:180]
    return f"Safety alert: {short.strip()}"[:180]


def infer_reason(action: Optional[str], summary: Optional[str]) -> str:
    if summary:
        # Try to paraphrase into a reason
        s = summary.strip().rstrip('.')
        if s.lower().startswith(("device recalled", "field safety notice", "safety alert")):
            # already contains a label; drop it
            s = re.sub(r"^(device recalled|field safety notice|safety alert)[:\-]?\s*", "", s, flags=re.I)
        templates = [
            f"Action taken due to: {s}.",
            f"Initiated after reports indicating {s}.",
            f"Mitigation implemented because {s}.",
        ]
        return random.choice(templates)
    # ultimate fallback
    return {
        "Recall": "Potential risk to patient safety necessitating product removal.",
        "FSN": "Advisory to distributors and hospitals regarding safe use.",
        "Safety Alert": "Correction to labelling/instructions to mitigate risk.",
    }.get(action or "Safety Alert")


def determine_type(action: str, summary: Optional[str], reason: Optional[str]) -> str:
    """Final 'type' based on semantics requested by user.
    - Mandatory product removal -> Recall
    - Advisory notice/alert to users -> Safety Alert
    - Official notice to distributors/hospitals -> Field Safety Notice
    """
    text = _norm(f"{summary or ''} {reason or ''}")

    if _contains_any(text, ["remove", "return", "destroy", "stop use", "quarantine", "withdraw", "recall", "retrieve", "dispose"]):
        return "Recall"
    if _contains_any(text, ["distributor", "hospital", "field safety notice", "advisory notice", "field action", "customer letter", "communication"]):
        return "FSN"
    if _contains_any(text, ["alert", "warning", "label", "labelling", "labeling", "ifu", "dfu", "instructions", "malfunction", "software", "update", "correction", "product correction", "field correction"]):
        return "Safety Alert"

    # default to the inferred action if nothing else
    return action if action in {"Recall", "FSN", "Safety Alert"} else "Safety Alert"


def classify_severity_class(reason: Optional[str], summary: Optional[str]) -> str:
    text = _norm(f"{reason or ''} {summary or ''}")
    # Score buckets, pick the one with the most hits; tie-breaker by priority I > II > III
    scores = {c: 0 for c in CLASS_KEYWORDS}
    for cls, kws in CLASS_KEYWORDS.items():
        for k in kws:
            if k in text:
                scores[cls] += 1

    if all(v == 0 for v in scores.values()):
        # heuristic fallback by action intensity
        if any(w in text for w in ["recall", "remove", "stop use", "electric", "shock", "over infusion", "dose"]):
            return "Class I"
        if any(w in text for w in ["false", "inaccurate", "sterility", "malfunction", "label", "software"]):
            return "Class II"
        return "Class III"

    # choose highest score; if tie, Class I > II > III
    ordered = sorted(scores.items(), key=lambda kv: (-kv[1], {"Class I": 0, "Class II": 1, "Class III": 2}[kv[0]]))
    return ordered[0][0]


def random_date(start: datetime, end: datetime) -> datetime:
    return start + timedelta(days=random.randint(0, (end - start).days))


def load_devices(device_csv: str) -> list:
    try:
        df = pd.read_csv(device_csv, encoding="latin1")
        if "id" not in df.columns:
            raise ValueError("devicepreprocessed.csv must have an 'id' column")
        return list(pd.to_numeric(df["id"], errors="coerce").dropna().astype(int).unique())
    except Exception:
        # fallback: create dummy device ids
        return list(range(1, 10_001))


def choose_reason() -> str:
    if random.random() < 0.6:
        return random.choice(REASONS_POOL)
    # generate a simple parametric reason
    issues = [
        "vacuum leak", "hydrogen embrittlement in bolts", "unexpected power loss", "incorrect electronic marker placement",
        "packaging seal failure", "false reactive rate increase", "dose miscalculation", "label text mismatch",
        "shelf-life data gap", "battery defect", "software freeze", "unhooking carabiner", "over infusion risk",
    ]
    actions = [
        "stop use", "remove from service", "update IFU", "install software update", "return affected stock",
        "quarantine affected lots", "perform inspection", "replace component", "recalibrate system",
    ]
    return f"Issue detected: {random.choice(issues)}; users instructed to {random.choice(actions)}."


def choose_summary() -> str:
    if random.random() < 0.6:
        return random.choice(SUMMARIES_POOL)
    verbs = ["recall", "field correction", "safety alert", "advisory notice"]
    subjects = [
        "software anomaly", "labelling discrepancy", "packaging integrity issue", "dose calculation risk",
        "false result rate", "power loss risk", "sterility concern",
    ]
    return f"{random.choice(verbs).title()} issued for {random.choice(subjects)}."


def generate_rows(n_rows: int = DEFAULT_N_ROWS,
                  device_csv: str = DEVICE_CSV,
                  manufacturer_csv: str = MANUFACTURER_CSV) -> pd.DataFrame:
    device_ids = load_devices(device_csv)

    # manufacturer file isn't needed except for existence; id range is fixed per user
    try:
        _ = pd.read_csv(manufacturer_csv, encoding="latin1")
    except Exception:
        pass

    rows = []
    for i in range(n_rows):
        initiated = random_date(START_DATE, END_DATE)
        posted = initiated + timedelta(days=random.randint(0, 30))
        terminated = initiated + timedelta(days=random.randint(30, 100))
        updated = posted + timedelta(days=random.randint(0, max(1, (terminated - posted).days)))

        # Base fields (some intentionally missing according to fractions)
        base_action = random.choice(["Recall", "FSN", "Safety Alert"]) if random.random() > MISSING_ACTION_FRAC else None
        base_reason = choose_reason() if random.random() > MISSING_REASON_FRAC else None
        base_summary = choose_summary() if random.random() > MISSING_SUMMARY_FRAC else None

        # Infer action if missing / refine with reason+summary
        action_final = classify_action(base_reason, base_summary, base_action)

        # Fill summary if missing
        if not base_summary:
            base_summary = generate_summary(action_final, base_reason)

        # Fill reason if missing
        if not base_reason:
            base_reason = infer_reason(action_final, base_summary)

        # Final 'type' (could differ from action depending on semantics)
        type_final = determine_type(action_final, base_summary, base_reason)

        # Action classification (Class I/II/III)
        action_classification = classify_severity_class(base_reason, base_summary)

        # Status: biased by whether termination date is close to initiated (more likely Terminated)
        status = random.choices(["Ongoing", "Terminated"], weights=[0.3, 0.7], k=1)[0]

        row = {
            "id": i + 1,
            "action": action_final,
            "action_classification": action_classification,
            "action_summary": base_summary,
            "reason": base_reason,
            # device id from file (or fallback)
            "device_id": random.choice(device_ids),
            # manufacturer id random in required range
            "manufacturer_id": random.randint(MANUFACTURER_ID_MIN, MANUFACTURER_ID_MAX),
            # type per final rule
            "type": type_final,
            "date_initiated_by_firm": initiated.strftime("%d-%m-%Y"),
            "date_posted": posted.strftime("%d-%m-%Y"),
            "date_terminated": terminated.strftime("%d-%m-%Y"),
            "status": status,
            "date_updated": updated.strftime("%d-%m-%Y"),
        }
        rows.append(row)

    return pd.DataFrame(rows)


def main(n_rows: int = DEFAULT_N_ROWS,
         device_csv: str = DEVICE_CSV,
         manufacturer_csv: str = MANUFACTURER_CSV,
         output_csv: str = OUTPUT_CSV):
    df = generate_rows(n_rows, device_csv, manufacturer_csv)
    df.to_csv(output_csv, index=False)

    # Console output kept minimal and clear
    print(f"✅ {output_csv} created with {len(df):,} rows")
    try:
        # Show a tidy preview
        with pd.option_context('display.max_colwidth', 80, 'display.width', 160):
            print(df.head(10))
    except Exception:
        print(df.head(10).to_string())


if __name__ == "__main__":
    # You can tweak DEFAULT_N_ROWS or pass args via a CLI/runner
    main()

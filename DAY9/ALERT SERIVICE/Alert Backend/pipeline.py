
import os, argparse, json, logging, yaml
import numpy as np
import pandas as pd
from dateutil import tz
from tqdm import tqdm
import joblib

from .ingest import ingest_all
from .features import build_device_month_frame, derive_serious_flags, label_device_months, rolling_features, add_static_and_manufacturer
from .text_feats import keyword_flags, compute_embeddings
from .modeling import train_temporal_cv, plot_curves, shap_summary

UTC = tz.UTC

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
    )

def main(args):
    setup_logging()
    with open(args.config, "r") as f:
        cfg = yaml.safe_load(f)

    rng = np.random.RandomState(cfg["random_seed"])
    os.makedirs(args.out_dir, exist_ok=True)

    # 1) Ingest
    logging.info("Ingesting data...")
    data = ingest_all(args.data_dir, cfg["date_cols"])
    event, device, manufacturer = data["event"], data["device"], data["manufacturer"]
    res, mdr, gudid = data["res"], data["mdr"], data["gudid"]

    if event is None or device is None or manufacturer is None:
        raise SystemExit("Missing required core files: event.* device.* manufacturer.*")

    # 2) Device-month frame (timeline)
    logging.info("Building device-month frame...")
    frame = build_device_month_frame(event, device, manufacturer)

    # 3) Labels
    logging.info("Deriving serious flags...")
    aligned = derive_serious_flags(event, mdr, cfg["serious_classes"])
    labels = label_device_months(frame, aligned, args.horizon_months)

    # 4) Features (<= t only)
    logging.info("Computing rolling features...")
    roll = rolling_features(frame, aligned, mdr, cfg["windows_months"])

    logging.info("Adding static features...")
    feats = add_static_and_manufacturer(frame)

    # Text embeddings + keyword flags
    logging.info("Text features (MiniLM + keywords)...")
    txt_cols = [c for c in ["action_summary","reason","description"] if c in event.columns or c in feats.columns]
    # Build device-month text by last N events up to t (simplified: device static description + last event text fields if available)
    dev_desc = device[["id","description"]].rename(columns={"id":"device_id","description":"device_desc"})
    feats = feats.merge(dev_desc, on="device_id", how="left")
    text_source = feats["device_desc"].fillna("")
    try:
        emb = compute_embeddings(text_source, cfg["embedding_model"])
    except Exception as e:
        logging.warning(f"Embedding model failed ({e}); falling back to zeros")
        emb = np.zeros((len(text_source), 384), dtype=float)  # MiniLM-L6

    emb_df = pd.DataFrame(emb, index=feats.index, columns=[f"emb_{i:03d}" for i in range(emb.shape[1])])
    kw = keyword_flags(feats, ["device_desc"], cfg["keywords"])
    feats_all = feats.join(roll.set_index(["device_id","month"]), on=["device_id","month"]).join(emb_df).join(kw)
    feats_all["year"] = feats_all["month"].dt.year

    # Align labels
    data_all = feats_all.merge(labels, on=["device_id","month"], how="left")
    data_all["y"] = data_all["y"].fillna(0).astype(int)

    # Feature selection: keep numeric + encoded categorical
    # Let LightGBM handle categoricals (strings). Just drop id/time columns, and text raw cols.
    drop_cols = {"device_id","month","created_at","updated_at","created_at_man","updated_at_man","name","name_man","address","parent_company","representative","device_desc","number","quantity_in_commerce"}
    features = [c for c in data_all.columns if c not in drop_cols and c not in ["y"]]

    # 5/6) Train models with temporal CV, optimize PR-AUC, early stopping
    logging.info("Training temporal CV...")
    best_model, calibrator, fold_metrics, oof = train_temporal_cv(
        data_all, features, "y", "year", args.out_dir, topk_frac=cfg["topk_percent"], use_focal=cfg.get("use_focal_loss", False)
    )

    # 7) Final OOF curves
    if oof.notna().any():
        plot_curves(data_all.loc[oof.index, "y"].values, oof.values, args.out_dir)

    # 8/9) SHAP
    if best_model is not None:
        logging.info("Computing SHAP summary on a sample...")
        idx_sample = np.random.choice(data_all.index, size=min(5000, len(data_all)), replace=False)
        top_feats = shap_summary(best_model, data_all.loc[idx_sample, features], features, args.out_dir)
    else:
        top_feats = []

    # 10) Watchlist
    logging.info("Creating watchlist for last month...")
    if len(data_all):
        last_month = data_all["month"].max()
        mask = data_all["month"] == last_month
        if best_model is not None:
            p = best_model.predict_proba(data_all.loc[mask, features])[:,1]
            if calibrator is not None:
                p = calibrator.transform(p)
        else:
            p = np.zeros(mask.sum())
        watch = data_all.loc[mask, ["device_id","month"]].copy()
        watch["score"] = p
        watch["top_features"] = ", ".join(top_feats[:5]) if top_feats else ""
        # naive recommended action by threshold quantiles
        q = np.quantile(watch["score"], 0.99) if len(watch) >= 100 else 0.9
        watch["recommended_action"] = np.where(watch["score"] >= q, "Immediate review & CAPA", "Monitor")
        watch["valid_for_month"] = last_month.dt.strftime("%Y-%m")
        watch = watch.sort_values("score", ascending=False)
        watch.to_csv(os.path.join(args.out_dir, "watchlist.csv"), index=False)

    # 11) Save artifacts / specs
    preproc = dict(features=features, config=cfg)
    joblib.dump(preproc, os.path.join(args.out_dir, "preproc.pkl"))
    with open(os.path.join(args.out_dir, "feature_specs.json"), "w") as f:
        json.dump({"features": features}, f, indent=2)

    logging.info("Done. Outputs saved to %s", args.out_dir)

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--data_dir", type=str, required=True, help="Directory with input files")
    p.add_argument("--out_dir", type=str, default="./outputs")
    p.add_argument("--config", type=str, default="config.yaml")
    p.add_argument("--horizon_months", type=int, default=6)
    args = p.parse_args()
    main(args)


import json, os
import numpy as np
import pandas as pd
from sklearn.model_selection import GroupKFold
from sklearn.metrics import average_precision_score, roc_auc_score, brier_score_loss, precision_recall_curve
from sklearn.calibration import IsotonicRegression
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.metrics import det_curve
from sklearn.utils import class_weight
import lightgbm as lgb
import shap
import joblib
import matplotlib.pyplot as plt

def make_lgbm(params=None, use_focal=False):
    base = dict(
        objective="binary",
        boosting_type="gbdt",
        n_estimators=3000,
        learning_rate=0.02,
        num_leaves=63,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced"
    )
    if params:
        base.update(params)
    if use_focal:
        base["objective"] = "binary_focal"  # LightGBM >= 4.0 supports focal
    return lgb.LGBMClassifier(**base)

def temporal_folds(df: pd.DataFrame, year_col="year", min_year=None, max_year=None):
    years = sorted(df[year_col].dropna().unique())
    for y in years[:-1]:
        train_idx = df.index[df[year_col] <= y]
        valid_idx = df.index[df[year_col] == (y+1)]
        if len(valid_idx) == 0 or len(train_idx) == 0:
            continue
        yield y, train_idx, valid_idx

def eval_topk(y_true, y_score, k_frac=0.01):
    n = len(y_true)
    k = max(1, int(np.ceil(n * k_frac)))
    idx = np.argsort(-y_score)[:k]
    recall_at_k = y_true[idx].sum() / max(1, y_true.sum())
    return recall_at_k, k

def train_temporal_cv(df, features, label_col, year_col, out_dir, topk_frac=0.01, use_focal=False):
    os.makedirs(out_dir, exist_ok=True)
    metrics_all = []
    models = []
    pr_best = -1.0
    best_model = None
    best_valid_year = None
    oof = pd.Series(index=df.index, dtype=float)

    for y, tr_idx, va_idx in temporal_folds(df, year_col):
        X_tr, y_tr = df.loc[tr_idx, features], df.loc[tr_idx, label_col]
        X_va, y_va = df.loc[va_idx, features], df.loc[va_idx, label_col]

        model = make_lgbm(use_focal=use_focal)
        model.fit(X_tr, y_tr, eval_set=[(X_va, y_va)], eval_metric="average_precision", callbacks=[lgb.early_stopping(200, verbose=False)])

        p_va = model.predict_proba(X_va)[:,1]
        oof.loc[va_idx] = p_va

        pr = average_precision_score(y_va, p_va)
        roc = roc_auc_score(y_va, p_va)
        br = brier_score_loss(y_va, p_va)
        rec_k, k = eval_topk(y_va.values, p_va, topk_frac)

        metrics = dict(valid_year=int(y+1), pr_auc=float(pr), roc_auc=float(roc), brier=float(br), recall_at_topk=float(rec_k), k=int(k))
        metrics_all.append(metrics)

        if pr > pr_best:
            pr_best = pr
            best_model = model
            best_valid_year = int(y+1)

    # Calibrate on last fold (highest year used as validation)
    if len(metrics_all):
        last_year = max(m["valid_year"] for m in metrics_all)
        va_idx = df.index[df[year_col] == last_year]
        calib = IsotonicRegression(out_of_bounds="clip")
        calib.fit(oof.loc[va_idx], df.loc[va_idx, label_col])
    else:
        calib = None

    # Save metrics
    with open(os.path.join(out_dir, "metrics.json"), "w") as f:
        json.dump({"folds": metrics_all}, f, indent=2)

    # Save best model + calibrator
    if best_model is not None:
        joblib.dump(best_model, os.path.join(out_dir, "model.bin"))
    if calib is not None:
        joblib.dump(calib, os.path.join(out_dir, "calibrator.pkl"))

    return best_model, calib, metrics_all, oof

def plot_curves(y_true, y_score, out_dir):
    os.makedirs(os.path.join(out_dir, "plots"), exist_ok=True)
    precision, recall, _ = precision_recall_curve(y_true, y_score)
    plt.figure()
    plt.plot(recall, precision)
    plt.xlabel("Recall")
    plt.ylabel("Precision")
    plt.title("Precision-Recall Curve")
    plt.savefig(os.path.join(out_dir, "plots", "precision_recall.png"), bbox_inches="tight")
    plt.close()

    # Calibration plot
    from sklearn.calibration import calibration_curve
    prob_true, prob_pred = calibration_curve(y_true, y_score, n_bins=10, strategy="quantile")
    plt.figure()
    plt.plot(prob_pred, prob_true, marker="o")
    plt.plot([0,1],[0,1], linestyle="--")
    plt.xlabel("Mean predicted prob")
    plt.ylabel("Fraction of positives")
    plt.title("Calibration Curve")
    plt.savefig(os.path.join(out_dir, "plots", "calibration_curve.png"), bbox_inches="tight")
    plt.close()

def shap_summary(model, X_sample, feature_names, out_dir):
    explainer = shap.TreeExplainer(model)
    sv = explainer.shap_values(X_sample)[1] if isinstance(model, lgb.LGBMClassifier) else explainer.shap_values(X_sample)
    shap.summary_plot(sv, features=X_sample, feature_names=feature_names, show=False)
    os.makedirs(os.path.join(out_dir, "plots"), exist_ok=True)
    import matplotlib.pyplot as plt
    plt.tight_layout()
    plt.savefig(os.path.join(out_dir, "plots", "shap_summary.png"), bbox_inches="tight")
    plt.close()
    # Return top feature names
    import numpy as np
    vals = np.abs(sv).mean(axis=0)
    idx = np.argsort(vals)[::-1][:10]
    return [feature_names[i] for i in idx]

# -*- coding: utf-8 -*-
# 🚀 Flask API for Device Failure Prediction

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

# --------------------------
# Initialize Flask
# --------------------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# --------------------------
# Load pipeline artifact
# --------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PIPELINE_FILE = os.path.join(BASE_DIR,"device_failure_pipeline.joblib")  # Your joblib file

try:
    artifact = joblib.load(PIPELINE_FILE)
    model = artifact["model"]
    feature_cols = artifact["feature_cols"]
    encoders = artifact["encoders"]
    print("✅ Pipeline loaded successfully.")
except Exception as e:
    print(f"❌ Error loading pipeline: {e}")
    artifact = None

# --------------------------
# Load original dataset (needed for device_id lookup)
# --------------------------
CSV_FILE = os.path.join(BASE_DIR, "events_cleaned_label_encoded.csv")
df = pd.read_csv(CSV_FILE, encoding="ISO-8859-1", low_memory=False)

# --------------------------
# Prediction function
# --------------------------
def predict_device_failure(device_id):
    device_row = df[df["device_id"] == device_id].copy()
    if device_row.empty:
        return {"error": f"Device ID {device_id} not found"}

    X_new = device_row[feature_cols].copy()

    # Apply encoders (must match training encoders)
    for col, le in encoders.items():
        if col in X_new:
            X_new[col] = le.transform(X_new[col].astype(str))

    pred_class = model.predict(X_new)[0]
    pred_prob = model.predict_proba(X_new)[0][1]

    return {
        "device_id": int(device_id),
        "failure_prediction": int(pred_class),
        "risk_percentage": round(float(pred_prob) * 100, 2),
        "within_50_days": "Yes" if pred_class == 1 else "No"
    }

# --------------------------
# API Routes
# --------------------------
@app.route("/predict/<int:device_id>", methods=["GET"])
def predict(device_id):
    try:
        result = predict_device_failure(device_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/bulk_predict", methods=["POST"])
def bulk_predict():
    try:
        data = request.get_json()
        device_ids = data.get("device_ids", [])
        if not device_ids:
            return jsonify({"error": "No device IDs provided"}), 400

        results = []
        for did in device_ids:
            res = predict_device_failure(did)
            results.append(res)

        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --------------------------
# Run Flask
# --------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7000, debug=True)

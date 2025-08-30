import traceback
from flask import Flask, jsonify, request
from flask_cors import CORS
import snowflake.connector
from datetime import datetime
import joblib
import pandas as pd
import joblib
import os

# Base path (directory where app.py is located)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

conn_params = {
    "user": "Logesh0904",
    "password": "Logi@123456789",
    "account": "pawcpyq-it31682",
    "warehouse": "COMPUTE_WH",
    "role": "ACCOUNTADMIN",
    "database": "MEDPREDICT",
    "schema": "PUBLIC"
}

def fetch_snowflake_data(query, params=None):
    """Fetch data from Snowflake with error handling."""
    try:
        conn = snowflake.connector.connect(**conn_params)
        cs = conn.cursor()
        try:
            if params:
                cs.execute(query, params)
            else:
                cs.execute(query)
            columns = [desc[0] for desc in cs.description]
            rows = cs.fetchall()
            return [dict(zip(columns, row)) for row in rows]
        finally:
            cs.close()
            conn.close()
    except Exception as e:
        print(f"Snowflake error: {e}")
        return []

@app.route("/api/device/<string:device_id>", methods=["GET"])
def get_device_details(device_id):
    """Get device details and related info from Snowflake."""
    try:
        devices = fetch_snowflake_data(
            "SELECT * FROM DEVICE WHERE ID = TRY_TO_NUMBER(%s)",
            (device_id,)
        )

        events = fetch_snowflake_data(
            "SELECT * FROM EVENTS WHERE DEVICE_ID = TRY_TO_NUMBER(%s)", 
            (device_id,)
        )

        manu_ids = set()
        for d in (devices or []):
            if d.get("MANUFACTURER_ID") is not None:
                manu_ids.add(d["MANUFACTURER_ID"])
        for e in (events or []):
            if e.get("MANUFACTURER_ID") is not None:
                manu_ids.add(e["MANUFACTURER_ID"])

        companies = []
        if manu_ids:
            placeholders = ",".join(["%s"] * len(manu_ids))
            query = f"SELECT * FROM COMPANY WHERE TRY_TO_NUMBER(ID) IN ({placeholders})"
            companies = fetch_snowflake_data(query, tuple(manu_ids))

        if devices or events:
            return jsonify({
                "device": devices or [],
                "events": events,
                "companies": companies,
                "manufacturers": companies,
                "source": "snowflake"
            })

    except Exception as e:
        print(f"Snowflake lookup failed: {e}")

    return jsonify({"error": "Device not found"}), 404

@app.route("/api/device/<string:device_id>/report", methods=["GET"])
def get_device_report(device_id):
    """Generate an HTML report for the device from Snowflake data."""
    data = get_device_details(device_id)
    if isinstance(data, tuple):  # error response
        return data

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Device Report - {device_id}</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            .header {{ background: #007bff; color: white; padding: 20px; margin-bottom: 20px; }}
            .section {{ margin-bottom: 30px; }}
            .section h2 {{ color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 10px; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            th {{ background-color: #f2f2f2; }}
            .no-data {{ color: #666; font-style: italic; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Device Analysis Report</h1>
            <p>Device ID: {device_id}</p>
            <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p>Data Source: snowflake</p>
        </div>
        
        <div class="section">
            <h2>Device Information</h2>
            {_generate_table_html(data.json.get_json()['device'])}
        </div>
        
        <div class="section">
            <h2>Related Events</h2>
            {_generate_table_html(data.json.get_json()['events'])}
        </div>
        
        <div class="section">
            <h2>Manufacturer/Company Information</h2>
            {_generate_table_html(data.json.get_json()['companies'])}
        </div>
    </body>
    </html>
    """
    return html

def _generate_table_html(data):
    if not data:
        return '<p class="no-data">No data available</p>'
    columns = list(data[0].keys())
    html = '<table><thead><tr>'
    for col in columns:
        html += f'<th>{col}</th>'
    html += '</tr></thead><tbody>'
    for row in data:
        html += '<tr>'
        for col in columns:
            html += f'<td>{row.get(col, "")}</td>'
        html += '</tr>'
    html += '</tbody></table>'
    return html

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "snowflake_connected": _test_snowflake_connection()
    })

def _test_snowflake_connection():
    try:
        fetch_snowflake_data("SELECT 1")
        return True
    except:
        return False

@app.route("/api/overview-metrics", methods=["GET"])
def get_overview_metrics():
    """Return total devices and class-based counts from Snowflake."""
    try:
        total_rows = fetch_snowflake_data("SELECT COUNT(*) AS TOTAL FROM DEVICE")
        total_devices = int(total_rows[0]["TOTAL"]) if total_rows else 0

        class_rows = fetch_snowflake_data(
            "SELECT RISK_CLASS AS CLASS, COUNT(*) AS CNT FROM DEVICE GROUP BY RISK_CLASS"
        )

        risk_count = critical_count = warning_count = 0
        for row in class_rows or []:
            cls = row.get("CLASS")
            cnt = int(row.get("CNT", 0))
            if cls in (1, "1", "risk", "RISK"):
                risk_count += cnt
            elif cls in (2, "2", "critical", "CRITICAL"):
                critical_count += cnt
            elif cls in (3, "3", "warning", "WARNING"):
                warning_count += cnt

        return jsonify({
            "source": "snowflake",
            "totalDevices": total_devices,
            "risk": risk_count,
            "critical": critical_count,
            "warning": warning_count
        })
    except Exception as e:
        print(f"Overview metrics Snowflake error: {e}")
        return jsonify({"error": "Failed to compute metrics"}), 500

@app.route("/api/devices/sample", methods=["GET"])
def get_sample_devices():
    """Return 4 random sample devices from Snowflake."""
    try:
        rows = fetch_snowflake_data(
            """
            SELECT 
                d.ID,
                d.NAME,
                d.MANUFACTURER_ID,
                c.NAME AS MANUFACTURER_NAME,
                (
                    SELECT MAX(COALESCE(e.DATE_UPDATED, e.DATE_INITIATED_BY_FIRM))
                    FROM EVENTS e 
                    WHERE e.DEVICE_ID = d.ID
                ) AS LAST_UPDATED_AT
            FROM DEVICE d
            LEFT JOIN COMPANY c ON c.ID = d.MANUFACTURER_ID
            WHERE d.ID >= 12530
            ORDER BY RANDOM()
            LIMIT 4
            """
        )
        return jsonify({"source": "snowflake", "devices": rows})
    except Exception as e:
        print(f"Sample devices error: {e}")
        return jsonify({"devices": []}), 500

@app.route("/api/devices/search", methods=["GET"])
def search_devices():
    """Search device by ID or fuzzy NAME/NUMBER in Snowflake."""
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"devices": []})

    try:
        if q.isdigit():
            rows = fetch_snowflake_data(
                """
                SELECT d.ID, d.NAME, d.MANUFACTURER_ID, c.NAME AS MANUFACTURER_NAME,
                (SELECT MAX(COALESCE(e.DATE_UPDATED, e.DATE_INITIATED_BY_FIRM)) 
                 FROM EVENTS e WHERE e.DEVICE_ID = d.ID) AS LAST_UPDATED_AT
                FROM DEVICE d
                LEFT JOIN COMPANY c ON c.ID = d.MANUFACTURER_ID
                WHERE d.ID = %s
                LIMIT 1
                """,
                (q,)
            )
        else:
            like = f"%{q}%"
            rows = fetch_snowflake_data(
                """
                SELECT d.ID, d.NAME, d.MANUFACTURER_ID, c.NAME AS MANUFACTURER_NAME,
                (SELECT MAX(COALESCE(e.DATE_UPDATED, e.DATE_INITIATED_BY_FIRM)) 
                 FROM EVENTS e WHERE e.DEVICE_ID = d.ID) AS LAST_UPDATED_AT
                FROM DEVICE d
                LEFT JOIN COMPANY c ON c.ID = d.MANUFACTURER_ID
                WHERE LOWER(d.NAME) LIKE LOWER(%s) 
                   OR LOWER(d.NUMBER) LIKE LOWER(%s)
                LIMIT 1
                """,
                (like, like)
            )
        return jsonify({"source": "snowflake", "devices": rows or []})
    except Exception as e:
        print(f"Search devices error: {e}")
#         return jsonify({"devices": []}), 500
# # Load Random Forest Artifacts
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# rf_model = joblib.load(os.path.join(BASE_DIR, "Rndom forest", "device_failure_pipeline.joblib"))
# @app.route("/api/predict/randomforest/<int:device_id>", methods=["GET"])
# def predict_randomforest(device_id):
#     try:
#         # 1. Fetch data from Snowflake
#         conn = snowflake.connector.connect(**conn_params)
#         query = f"""
#             SELECT *
#             FROM EVENTS_CLEANED_LABEL_ENCODED
#             WHERE DEVICE_ID = {device_id}
#             LIMIT 1
#         """
#         df = pd.read_sql(query, conn)
#         conn.close()

#         # 2. Handle missing device
#         if df.empty:
#             return jsonify({"error": f"Device ID {device_id} not found"}), 404

#         # 3. Drop target column if present
#         if "FAILURE" in df.columns:
#             df = df.drop(columns=["FAILURE"])

#         # 4. Align features (important!)
#         if feature_cols is not None:
#             df = df.reindex(columns=feature_cols, fill_value=0)

#         # 5. Predict
#         pred_class = rf_model.predict(df)[0]
#         pred_prob = rf_model.predict_proba(df)[0][1]  # probability of class=1

#         # 6. Return JSON response
#         return jsonify({
#             "device_id": int(device_id),
#             "model": "random_forest",
#             "failure_prediction": int(pred_class),
#             "risk_percentage": round(float(pred_prob) * 100, 2),
#             "within_50_days": "Yes" if pred_class == 1 else "No"
#         })

#     except Exception as e:
#         return jsonify({
#             "error": str(e),
#             "trace": traceback.format_exc()
#         }), 500
# Load Logistic Regression Artifacts
# model = joblib.load(os.path.join(BASE_DIR, "random forest", "device_failure_model.joblib"))
# feature_cols = joblib.load(os.path.join(BASE_DIR, "random forest", "feature_columns.joblib"))
# encoders = joblib.load(os.path.join(BASE_DIR, "random forest", "feature_encoders.joblib"))
# @app.route("/api/predictRandomForest/<int:device_id>", methods=["GET"])
# def predict_randomforest(device_id):
#     try:
#         print(f"🔍 Predict request received for device_id: {device_id}")

#         # Connect to Snowflake
#         conn = snowflake.connector.connect(**conn_params)
#         query = f"""
#             SELECT *
#             FROM EVENTS_CLEANED_LABEL_ENCODED
#             WHERE DEVICE_ID = {device_id}
#             LIMIT 1
#         """
#         print("📄 Running query:", query)
#         df = pd.read_sql(query, conn)
#         conn.close()

#         if df.empty:
#             return jsonify({"error": f"No data found for device_id {device_id}"}), 404

#         # Align features
#         X = df[feature_cols]
#         print("✅ Features prepared:", X.columns.tolist())

#         # Predict
#         prediction = model.predict(X)[0]
#         probas = model.predict_proba(X)[0]

#         result = {
#             "device_id": device_id,
#             "failure_prediction": int(prediction),
#             "risk_percentage": round(max(probas) * 100, 2),
#             "within_50_days": "Yes" if prediction == 1 else "No"
#         }

#         print("✅ Prediction Result:", result)
#         return jsonify(result)

#     except Exception as e:
#         print("❌ Internal Server Error:", str(e))
#         return jsonify({"error": str(e)}), 500

@app.route("/api/predictLogistic/<int:device_id>", methods=["GET"])
def predict_device(device_id):
    try:
        # reload inside function (ensures no cached state)
        model = joblib.load(os.path.join(BASE_DIR, "logistic", "device_failure_model.joblib"))
        scaler = joblib.load(os.path.join(BASE_DIR, "logistic", "scaler.joblib"))
        feature_cols = joblib.load(os.path.join(BASE_DIR, "logistic", "feature_columns.joblib"))

        # 1. Fetch device row from Snowflake
        conn = snowflake.connector.connect(**conn_params)
        query = f"""
            SELECT *
            FROM EVENTS_CLEANED_LABEL_ENCODED
            WHERE DEVICE_ID = {device_id}
            LIMIT 1
        """
        df = pd.read_sql(query, conn)
        conn.close()

        if df.empty:
            return jsonify({"error": f"Device ID {device_id} not found"}), 404

        # 2. Align with feature columns
        missing = [c for c in feature_cols if c not in df.columns]
        for col in missing:
            df[col] = 0

        X_new = df[feature_cols].copy()

        # Encode categorical
        for col in X_new.select_dtypes(include=["object"]).columns:
            X_new[col] = X_new[col].astype("category").cat.codes

        # 3. Apply same scaler
        X_new = scaler.transform(X_new)

        # 4. Predict
        pred_class = model.predict(X_new)[0]
        pred_prob = model.predict_proba(X_new)[0][1]

        result = {
            "device_id": int(device_id),
            "failure_prediction": int(pred_class),
            "risk_percentage": round(float(pred_prob) * 100, 2),
            "within_50_days": "Yes" if pred_class == 1 else "No"
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# model = joblib.load(os.path.join(BASE_DIR, "decision", "device_failure_model.joblib"))
# feature_cols = joblib.load(os.path.join(BASE_DIR, "decision", "feature_columns.joblib"))
# @app.route("/api/predict/<int:device_id>", methods=["GET"])
# def predict_device(device_id):
#     try:
#         conn = snowflake.connector.connect(**conn_params)
#         query = f"""
#             SELECT *
#             FROM EVENTS_CLEANED_LABEL_ENCODED
#             WHERE DEVICE_ID = {device_id}
#             LIMIT 1
#         """
#         df = pd.read_sql(query, conn)
#         conn.close()

#         if df.empty:
#             return jsonify({"error": f"Device ID {device_id} not found"}), 404

#         # Debugging: show which features exist vs expected
#         print("Snowflake columns:", df.columns.tolist())
#         print("Expected features:", feature_cols)

#         # Align columns
#         missing = [c for c in feature_cols if c not in df.columns]
#         for col in missing:
#             df[col] = 0  

#         X_new = df[feature_cols].copy()

#         # Encode categorical features
#         for col in X_new.select_dtypes(include=["object"]).columns:
#             X_new[col] = X_new[col].astype("category").cat.codes

#         # Predict
#         pred_class = model.predict(X_new)[0]
#         pred_prob = model.predict_proba(X_new)[0][1]

#         return jsonify({
#             "device_id": int(device_id),
#             "failure_prediction": int(pred_class),
#             "risk_percentage": round(float(pred_prob) * 100, 2),
#             "within_50_days": "Yes" if pred_class == 1 else "No"
#         })

#     except Exception as e:
#         print("🔥 ERROR:", str(e))
#         return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

import traceback
from flask import Flask, jsonify, request, render_template_string
from flask_cors import CORS
import snowflake.connector
from datetime import datetime
import joblib
import pandas as pd
import joblib
import os
import json
import requests
from config import *
import pdfkit
import boto3
from werkzeug.utils import secure_filename
import random
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Novu Configuration from config.py
# NOVU_API_KEY, NOVU_BASE_URL, NOVU_WORKFLOW_ID, NOVU_SUBSCRIBER_ID are now imported from config.py

S3_BUCKET = "pdfstorageas"
S3_REGION = "us-east-1"   
AWS_ACCESS_KEY = "AKIAZKXSV2B5A5ZU7D66"
AWS_SECRET_KEY = "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"

s3_client = boto3.client(
    "s3",
    region_name=S3_REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY
)

try:
    s3_client.head_bucket(Bucket=S3_BUCKET)  # Simple check if bucket is accessible
    print(f"✅ Successfully connected to S3 bucket: {S3_BUCKET} in {S3_REGION}")
except Exception as e:
    print(f"❌ Failed to connect to S3: {e}")


@app.route("/upload", methods=["POST"])
def upload_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files allowed"}), 400

    filename = secure_filename(file.filename)

    try:
        s3_client.upload_fileobj(file, S3_BUCKET, filename)
        file_url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{filename}"
        print(f"📤 Uploaded file: {filename}")
        return jsonify({"message": "File uploaded successfully", "url": file_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/list", methods=["GET"])
def list_pdfs():
    try:
        response = s3_client.list_objects_v2(Bucket=S3_BUCKET)
        files = []
        if "Contents" in response:
            for obj in response["Contents"]:
                if obj["Key"].lower().endswith(".pdf"):
                    files.append({
                        "filename": obj["Key"],
                        "url": f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{obj['Key']}",
                        "size": obj["Size"]
                    })
        print(f"📂 Listed {len(files)} PDFs from bucket")
        return jsonify(files)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


conn_params = {
    "user": SNOWFLAKE_USER,
    "password": SNOWFLAKE_PASSWORD,
    "account": SNOWFLAKE_ACCOUNT,
    "warehouse": SNOWFLAKE_WAREHOUSE,
    "role": SNOWFLAKE_ROLE,
    "database": SNOWFLAKE_DATABASE,
    "schema": SNOWFLAKE_SCHEMA
}
def map_risk_class(risk):
    if str(risk).upper() in ["I", "1"]:
        return "Risk"
    elif str(risk).upper() in ["II", "2"]:
        return "Warning"
    elif str(risk).upper() in ["III", "3"]:
        return "Safe"
    return "Unknown"

@app.route("/devices", methods=["GET"])
def get_devices():
    try:
        conn = snowflake.connector.connect(**conn_params)
        cur = conn.cursor()
        cur.execute("SELECT * FROM DEVICE")
        rows = cur.fetchall()
        cur.close()
        conn.close()

        random.shuffle(rows)
        sample = rows[:10]

        devices = []
        for r in sample:
            devices.append({
                "id": r[0],
                "name": r[6],
                "quantity": r[8],
                "risk_class": map_risk_class(r[9]),
                "slug": r[10],
                "country": r[11]
            })
        return jsonify(devices)
    except Exception as e:
        print(f"Error fetching devices: {e}")
        return jsonify({"error": "Failed to fetch devices"}), 500

@app.route("/devices", methods=["POST"])
def add_device():
    try:
        data = request.json
        conn = snowflake.connector.connect(**conn_params)
        cur = conn.cursor()

        # Get max ID
        cur.execute("SELECT MAX(ID) FROM DEVICE")
        last_id = cur.fetchone()[0] or 104296
        new_id = last_id + 1

        cur.execute("""
            INSERT INTO DEVICE (ID, NAME, QUANTITY_IN_COMMERCE, RISK_CLASS, SLUG, COUNTRY, MANUFACTURER_ID)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            new_id,
            data.get("name"),
            data.get("quantity"),
            data.get("risk_class"),
            data.get("slug"),
            data.get("country"),
            data.get("manufacturer_id", 1)
        ))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Device added", "id": new_id})
    except Exception as e:
        print(f"Error adding device: {e}")
        return jsonify({"error": "Failed to add device"}), 500


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
    
@app.route("/api/company/<int:company_id>/details", methods=["GET"])
def get_company_details(company_id):
    try:
        # Query Snowflake for company info
        query = """
            SELECT ID, ADDRESS, COMMENT, NAME, PARENT_COMPANY
            FROM COMPANY
            WHERE ID = %s
        """
        company_info = fetch_snowflake_data(query, (company_id,))

        if not company_info:
            return jsonify({"error": "Company not found"}), 404

        # Format response
        company = {
            "id": company_info[0]["ID"],
            "address": company_info[0]["ADDRESS"],
            "comment": company_info[0]["COMMENT"],
            "name": company_info[0]["NAME"],
            "parent_company": company_info[0]["PARENT_COMPANY"],
        }

        return jsonify({"company": company}), 200

    except Exception as e:
        print("Error fetching company details:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/api/device/<string:device_id>", methods=["GET"])
def get_device_details(device_id):
    """Get device details, manufacturer, events, and prediction."""
    try:
        devices = fetch_snowflake_data(
            "SELECT * FROM DEVICE WHERE ID = TRY_TO_NUMBER(%s)",
            (device_id,)
        )

        device_obj = devices[0] if devices else None

        events = fetch_snowflake_data(
            "SELECT * FROM EVENTS WHERE DEVICE_ID = TRY_TO_NUMBER(%s)", 
            (device_id,)
        )

        company_obj = None
        if device_obj and device_obj.get("MANUFACTURER_ID") is not None:
            comp = fetch_snowflake_data(
                "SELECT * FROM COMPANY WHERE ID = TRY_TO_NUMBER(%s)",
                (device_obj["MANUFACTURER_ID"],)
            )
            company_obj = comp[0] if comp else None

        # Inline prediction using existing function if available
        prediction_obj = None
        try:
            pred = predict_device_failure(int(device_id))
            if isinstance(pred, dict) and "error" not in pred:
                prediction_obj = pred
        except Exception:
            prediction_obj = None

        if device_obj or events:
            return jsonify({
                "device": device_obj,
                "company": company_obj,
                "events": events or [],
                "prediction": prediction_obj,
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

    html = ""
    for row in data:
        html += '<div class="record">'
        for col, val in row.items():
            html += f"""
                <div class="field-block">
                    <p class="field-name"><strong>{col.replace('_', ' ').title()}</strong></p>
                    <p class="field-value">{val if val else '-'}</p>
                </div>
            """
        html += "<hr/></div>"
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
        return jsonify({"devices": []}), 500

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PIPELINE_FILE = os.path.join(BASE_DIR,"Rndom forest","device_failure_pipeline.joblib") 

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
CSV_FILE = os.path.join(BASE_DIR, "Rndom forest" , "events_cleaned_label_encoded.csv")
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

@app.route("/api/dashboard/devices", methods=["GET"])
def dashboard_devices():
    query = """
        SELECT 
            d.ID AS device_id,
            d.NAME AS device_name,
            d.CODE,
            d.CLASSIFICATION,
            d.RISK_CLASS,
            d.IMPLANTED,
            d.COUNTRY,
            d.QUANTITY_IN_COMMERCE,
            c.ID AS company_id,
            c.NAME AS company_name,
            c.ADDRESS AS company_address,
            c.PARENT_COMPANY
        FROM MEDPREDICT.PUBLIC.DEVICE d
        LEFT JOIN MEDPREDICT.PUBLIC.COMPANY c 
            ON d.MANUFACTURER_ID = c.ID;
    """
    try:
        results = fetch_snowflake_data(query)
        return jsonify({"devices": results})
    except Exception as e:
        print(f"Devices query failed: {e}")
        return jsonify({"error": "Failed to fetch devices"}), 500

@app.route("/api/dashboard/summary", methods=["GET"])
def dashboard_summary():
    query = """
        SELECT
            (SELECT COUNT(ID) FROM MEDPREDICT.PUBLIC.COMPANY) AS total_manufacturers,
            (SELECT COUNT( PARENT_COMPANY) 
             FROM MEDPREDICT.PUBLIC.COMPANY 
             WHERE PARENT_COMPANY IS NOT NULL) AS total_parent_companies,
            (SELECT COUNT(*) 
             FROM MEDPREDICT.PUBLIC.DEVICE 
             WHERE UPPER(IMPLANTED) = 'YES') AS implanted_devices,
            (SELECT COUNT(*) 
             FROM MEDPREDICT.PUBLIC.DEVICE 
             WHERE UPPER(IMPLANTED) = 'NO') AS non_implanted_devices;
    """
    try:
        result = fetch_snowflake_data(query)
        return jsonify(result[0] if result else {})
    except Exception as e:
        print(f"Summary query failed: {e}")
        return jsonify({"error": "Failed to fetch summary"}), 500

@app.route("/api/dashboard/risk", methods=["GET"])
def dashboard_risk():
    query = """
        SELECT RISK_CLASS, COUNT(*) AS DEVICE_COUNT
        FROM MEDPREDICT.PUBLIC.DEVICE
        GROUP BY RISK_CLASS;
    """
    try:
        results = fetch_snowflake_data(query)
        return jsonify({"risk_stats": results})
    except Exception as e:
        print(f"Risk query failed: {e}")
        return jsonify({"error": "Failed to fetch risk stats"}), 500

@app.route("/report/<int:device_id>", methods=["GET"])
def device_report(device_id):
    try:
        # Fetch device + manufacturer in one JOIN query
        device_with_company = fetch_snowflake_data(
            """
            SELECT d.*, c.ID AS COMPANY_ID, c.NAME AS COMPANY_NAME,
                   c.ADDRESS AS COMPANY_ADDRESS, c.PARENT_COMPANY, c.COMMENT AS COMPANY_COMMENT
            FROM MEDPREDICT.PUBLIC.DEVICE d
            LEFT JOIN MEDPREDICT.PUBLIC.COMPANY c
            ON d.MANUFACTURER_ID = c.ID
            WHERE d.ID = TRY_TO_NUMBER(%s)
            """,
            (device_id,)
        )

        device = None
        company = None
        if device_with_company:
            row = device_with_company[0]
            # Separate device + company dicts
            device = {k: v for k, v in row.items() if not k.startswith("COMPANY_")}
            company = {
                "ID": row.get("COMPANY_ID"),
                "NAME": row.get("COMPANY_NAME"),
                "ADDRESS": row.get("COMPANY_ADDRESS"),
                "PARENT_COMPANY": row.get("PARENT_COMPANY"),
                "COMMENT": row.get("COMPANY_COMMENT")
            } if row.get("COMPANY_ID") else None

        # Fetch related events
        events = fetch_snowflake_data(
            "SELECT * FROM MEDPREDICT.PUBLIC.EVENTS WHERE DEVICE_ID = TRY_TO_NUMBER(%s)",
            (device_id,)
        )

        # Run prediction
        prediction = predict_device_failure(device_id)

        # Auto print flag
        auto = request.args.get('autoprint') in ('1', 'true', 'True')

        # Render
        return _render_report_html(device, events, company, prediction, device_id, auto)

    except Exception as e:
        return f"Error generating report: {str(e)}", 500

@app.route("/report/view", methods=["POST"])
def device_report_view():
	"""Accepts JSON or form 'payload' JSON and renders modern report."""
	data = request.get_json(silent=True)
	if not data and request.form.get('payload'):
		try:
			data = json.loads(request.form.get('payload'))
		except Exception:
			data = None
	if not data:
		return jsonify({"error": "Missing payload"}), 400
	device = data.get("device")
	events = data.get("events")
	company = data.get("company")
	prediction = data.get("prediction")
	
	device_id = None
	if isinstance(prediction, dict) and prediction.get("device_id") is not None:
		device_id = prediction.get("device_id")
	elif isinstance(device, dict) and device.get("ID") is not None:
		device_id = device.get("ID")
	auto = request.form.get('autoprint') in ('1', 'true', 'True') or bool(data.get('autoprint'))
	return _render_report_html(device, events, company, prediction, device_id, auto)


from flask import render_template_string
from datetime import datetime


def _render_report_html(device, events, company, prediction, device_id, auto_print=False):
    html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Device Report - {{ device_id }}</title>
        <style>
            :root { --bg: #ffffff; --card: #f8fafc; --muted: #64748b; --text: #1e293b; --accent: #3b82f6; --ok: #10b981; --warn: #ef4444; --light-blue: #dbeafe; }
            * { box-sizing: border-box; }
            body { font-family: Inter, Arial, sans-serif; margin: 0; background: var(--bg); color: var(--text); }
            
            .container { max-width: 1280px; width: 100%; margin: 0 auto; padding: 28px; }
            .doc { background: var(--bg); border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .doc-header { padding: 24px 28px; background: linear-gradient(180deg, var(--light-blue), #f1f5f9); border-bottom: 1px solid #e2e8f0; }
            .doc-title { margin: 0; font-size: 24px; color: var(--accent); font-weight: 600; }
            .meta { display: flex; gap: 16px; margin-top: 8px; color: var(--muted); font-size: 12px; flex-wrap: wrap; }
            .grid { display: grid; grid-template-columns: 1fr; gap: 18px; padding: 20px 24px; }
            @media (min-width: 900px) { .grid { grid-template-columns: 1fr 1fr; } }
            .card { background: var(--card); border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
            .card h2 { margin: 0 0 10px; font-size: 16px; color: var(--accent); font-weight: 600; }
            .pill { display: inline-block; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 500; }
            .pill.risk { background: #fef2f2; color: var(--warn); border: 1px solid #fecaca; }
            .pill.safe { background: #f0fdf4; color: var(--ok); border: 1px solid #bbf7d0; }
            .no-data { color: var(--muted); font-style: italic; }

            .outline { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
            .outline-row { font-size: 13px; border-bottom: 1px dashed #e2e8f0; padding: 4px 0; }
            .outline-key { font-weight: 600; color: var(--muted); margin-right: 6px; }
            .outline-val { color: var(--text); }

            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border-bottom: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; font-size: 13px; }
            th { color: var(--muted); font-weight: 600; background: #f8fafc; }
            .actions { display: flex; gap: 12px; padding: 16px 24px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
            .btn { border: 1px solid #d1d5db; background: var(--bg); color: var(--text); padding: 10px 14px; border-radius: 8px; cursor: pointer; font-weight: 600; }
            .btn.pdf { background: var(--light-blue); color: var(--accent); border-color: var(--accent); }
            .btn.novu { background: #10b981; color: white; border-color: #10b981; }
            .btn.novu:hover { background: #059669; }
            .alert-status { margin-top: 10px; padding: 10px; border-radius: 8px; font-size: 14px; }
            .alert-success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
            .alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
            @media print { .no-print { display: none; } body { background: white; } .doc { box-shadow: none; border: 1px solid #ccc; } }
        </style>
    </head>
    <body>
        <div class="container">
          <div class="doc">
            <div class="doc-header">
              <h1 class="doc-title">Device Analysis Report</h1>
              <div class="meta">
                <span>Device ID: <b>{{ device_id }}</b></span>
                <span>Generated: {{ now }}</span>
                <span>Source: Snowflake</span>
              </div>
            </div>
            <div class="grid">
              <div class="card">
                <h2>Prediction Health</h2>
                {% if prediction and not prediction.get('error') %}
                  <div class="pill {% if prediction.failure_prediction == 1 %}risk{% else %}safe{% endif %}">
                    {% if prediction.failure_prediction == 1 %}High Risk{% else %}Low Risk{% endif %}
                  </div>
                  <div style="margin-top: 10px; font-size: 13px; color: var(--muted)">
                    Risk %: <b style="color: var(--text)">{{ prediction.risk_percentage }}</b><br/>
                    Within 50 days: <b style="color: var(--text)">{{ prediction.within_50_days }}</b>
                  </div>
                {% else %}
                  <div class="no-data">No prediction available.</div>
                {% endif %}
              </div>
              <div class="card">
                <h2>Manufacturer</h2>
                {{ table_compact(company) | safe }}
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 1fr;">
              <div class="card">
                <h2>Device Information</h2>
                {{ outline_table(device) | safe }}
              </div>
              <div class="card">
                <h2>Related Events</h2>
                {{ outline_table(events) | safe }}
              </div>
            </div>
            <div class="actions no-print">
              <button type="button" class="btn novu" onclick="sendNovuAlert()">📧 Send Alert via Novu</button>
              <button type="button" class="btn pdf" onclick="window.print()">Download PDF</button>
            </div>
            <div id="alertStatus" class="alert-status" style="display: none;"></div>
          </div>
        </div>
        <script>
          (function(){
            var auto = {{ 'true' if auto_print else 'false' }};
            if (auto) { setTimeout(function(){ window.print(); }, 300); }
          })();
          
          async function sendNovuAlert() {
            const alertBtn = document.querySelector('.btn.novu');
            const statusDiv = document.getElementById('alertStatus');
            
            alertBtn.disabled = true;
            alertBtn.textContent = '📧 Sending...';
            
            try {
                const response = await fetch('/api/alert/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        deviceId: {{ device_id }},
                        severity: '{{ "high" if prediction and prediction.get("failure_prediction") == 1 else "medium" }}'
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    statusDiv.className = 'alert-status alert-success';
                    statusDiv.innerHTML = `
                        ✅ <strong>Alert sent successfully!</strong><br>
                        Device ID: ${result.deviceId}<br>
                        Timestamp: ${new Date(result.timestamp).toLocaleString()}<br>
                        Novu Status: ${result.message}
                    `;
                } else {
                    statusDiv.className = 'alert-status alert-error';
                    statusDiv.innerHTML = `
                        ❌ <strong>Alert failed to send!</strong><br>
                        Error: ${result.error}
                    `;
                }
            } catch (error) {
                statusDiv.className = 'alert-status alert-error';
                statusDiv.innerHTML = `
                    ❌ <strong>Network error!</strong><br>
                    Error: ${error.message}
                `;
            } finally {
                alertBtn.disabled = false;
                alertBtn.textContent = '📧 Send Alert via Novu';
                statusDiv.style.display = 'block';
                
                setTimeout(() => { statusDiv.style.display = 'none'; }, 5000);
            }
          }
        </script>
    </body>
    </html>
    '''

    return render_template_string(
        html,
        device_id=device_id,
        now=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        device=device,
        events=events,
        company=company,
        prediction=prediction,
        auto_print=auto_print,
        outline_table=outline_table,
        table_compact=table_compact,
    )


def outline_table(data):
    if not data:
        return '<p class="no-data">No data available</p>'
    
    html = '<div class="outline">'
    if isinstance(data, dict):
        for k, v in data.items():
            html += f'<div class="outline-row"><span class="outline-key">{k}</span>: <span class="outline-val">{v}</span></div>'
    elif isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
        for idx, row in enumerate(data, 1):
            html += f'<div style="margin-top:6px;font-weight:600;">Event {idx}</div>'
            for k, v in row.items():
                html += f'<div class="outline-row"><span class="outline-key">{k}</span>: <span class="outline-val">{v}</span></div>'
    else:
        return '<p class="no-data">Invalid format</p>'
    
    html += '</div>'
    return html


def table_compact(data):
    if not data:
        return '<p class="no-data">No manufacturer data available</p>'
    if isinstance(data, list):
        data = data[0] if data else {}
    keys = list(data.keys())
    if not keys:
        return '<p class="no-data">No manufacturer data available</p>'
    
    rows = ''
    for k, v in data.items():
        if v is not None:
            rows += f'<tr><th style="width: 180px">{k}</th><td>{v}</td></tr>'
    if not rows:
        return '<p class="no-data">No manufacturer data available</p>'
    return f'<table><tbody>{rows}</tbody></table>'


@app.route("/report/download", methods=["POST"])
def download_report():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Missing payload"}), 400

    # Render HTML with your same report function
    html = _render_report_html(
        device=data.get("device"),
        events=data.get("events"),
        company=data.get("company"),
        prediction=data.get("prediction"),
        device_id=data.get("prediction", {}).get("device_id"),
        auto_print=False
    )

    # Convert HTML → PDF
    pdf = pdfkit.from_string(html, False)

    # Upload PDF to S3
    filename = f"reports/device_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    try:
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=filename,
            Body=pdf,
            ContentType="application/pdf"
        )
        file_url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{filename}"
        return jsonify({"success": True, "url": file_url})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
@app.route("/alert/<int:device_id>", methods=["POST"])
def send_alert(device_id):
    # Get device prediction data
    prediction = predict_device_failure(device_id)
    
    # Get device details from Snowflake
    device_info = fetch_snowflake_data(
        "SELECT * FROM DEVICE WHERE ID = ?",
        (device_id,)
    )
    
    device_data = device_info[0] if device_info else {}
    
    # Prepare device data for Novu
    device_payload = {
        "id": device_id,
        "name": device_data.get("NAME", "Unknown Device"),
        "manufacturer": device_data.get("MANUFACTURER_NAME", "Unknown"),
        "type": device_data.get("CLASSIFICATION", "Medical Device"),
        "location": device_data.get("COUNTRY", "Unknown")
    }
    
    # Determine severity based on prediction
    severity = "high" if prediction and prediction.get("failure_prediction") == 1 else "medium"
    
    # Send alert via Novu
    novu_result = send_novu_alert(device_data, prediction, severity)
    
    if novu_result["success"]:
        # Show success page with Novu confirmation
        html = '''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Alert Sent via Novu - {{ device_id }}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: #f8f9fa; }
                .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 25px; margin: -30px -30px 30px -30px; border-radius: 12px 12px 0 0; text-align: center; }
                .success-icon { font-size: 3rem; margin-bottom: 15px; }
                .prediction-box { margin: 25px 0; padding: 20px; border-radius: 8px; font-size: 1.1em; border-left: 5px solid; }
                .risk { background: #fff5f5; color: #b71c1c; border-left-color: #f44336; }
                .safe { background: #f0fff4; color: #1b5e20; border-left-color: #4caf50; }
                .novu-info { background: #e3f2fd; border: 1px solid #2196f3; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .back-btn { background: #007bff; color: #fff; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.1em; transition: all 0.3s ease; }
                .back-btn:hover { background: #0056b3; transform: translateY(-2px); }
                .device-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dee2e6; }
                .detail-row:last-child { border-bottom: none; }
                .detail-label { font-weight: bold; color: #495057; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="success-icon">✅</div>
                    <h1>Alert Sent Successfully via Novu!</h1>
                    <p>Device ID: {{ device_id }}</p>
                </div>
                
                <div class="novu-info">
                    <h3>📧 Novu Notification Sent</h3>
                    <p><strong>Status:</strong> Email notification delivered to subscriber</p>
                    <p><strong>Workflow:</strong> medpredict</p>
                    <p><strong>Subscriber:</strong> LOGESH S (727722euai032@skcet.ac.in)</p>
                    <p><strong>Timestamp:</strong> {{ timestamp }}</p>
                </div>
                
                {% if device_data %}
                <div class="device-details">
                    <h3>📱 Device Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Device Name:</span>
                        <span>{{ device_data.NAME or "Unknown" }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Manufacturer:</span>
                        <span>{{ device_data.MANUFACTURER_NAME or "Unknown" }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Classification:</span>
                        <span>{{ device_data.CLASSIFICATION or "Unknown" }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Country:</span>
                        <span>{{ device_data.COUNTRY or "Unknown" }}</span>
                    </div>
                </div>
                {% endif %}
                
                {% if prediction and not prediction.get('error') %}
                    <div class="prediction-box {% if prediction.failure_prediction == 1 %}risk{% else %}safe{% endif %}">
                        <h3>🤖 Prediction Result</h3>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span>{% if prediction.failure_prediction == 1 %}⚠️ High Risk{% else %}✅ Low Risk{% endif %}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Risk Percentage:</span>
                            <span>{{ prediction.risk_percentage }}%</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Within 50 days:</span>
                            <span>{{ prediction.within_50_days }}</span>
                        </div>
                    </div>
                {% else %}
                    <div class="prediction-box safe">
                        <h3>🤖 Prediction Result</h3>
                        <p>No prediction available for this device.</p>
                    </div>
                {% endif %}
                
                <div style="text-align: center; margin-top: 30px;">
                    <form action="/report/{{ device_id }}" method="get" style="display: inline-block; margin-right: 15px;">
                        <button type="submit" class="back-btn">📄 View Full Report</button>
                    </form>
                    <button onclick="window.close()" class="back-btn" style="background: #6c757d;">✖️ Close</button>
                </div>
            </div>
        </body>
        </html>
        '''
        return render_template_string(
            html, 
            device_id=device_id, 
            prediction=prediction, 
            device_data=device_data,
            timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        )
    else:
        # Show error page if Novu failed
        html = '''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Alert Failed - {{ device_id }}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: #f8f9fa; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; }
                .header { background: #dc3545; color: white; padding: 25px; margin: -30px -30px 30px -30px; border-radius: 12px 12px 0 0; }
                .error-icon { font-size: 3rem; margin-bottom: 15px; }
                .error-details { background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0; color: #721c24; }
                .back-btn { background: #007bff; color: #fff; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.1em; }
                .back-btn:hover { background: #0056b3; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="error-icon">❌</div>
                    <h1>Alert Failed to Send</h1>
                    <p>Device ID: {{ device_id }}</p>
                </div>
                
                <div class="error-details">
                    <h3>📧 Novu Notification Failed</h3>
                    <p><strong>Error:</strong> {{ error_message }}</p>
                    <p>Please try again or contact support.</p>
                </div>
                
                <div style="margin-top: 30px;">
                    <form action="/report/{{ device_id }}" method="get" style="display: inline-block;">
                        <button type="submit" class="back-btn">📄 Back to Report</button>
                    </form>
                </div>
            </div>
        </body>
        </html>
        '''
        return render_template_string(
            html, 
            device_id=device_id, 
            error_message=novu_result.get("error", "Unknown error")
        )

@app.route("/test-alert", methods=["GET"])
def test_alert_page():
    """Serve the HTML test page for direct alert testing"""
    try:
        with open('test_alert.html', 'r', encoding='utf-8') as f:
            html_content = f.read()
        return html_content
    except FileNotFoundError:
        return "Test page not found. Make sure test_alert.html exists in the backend directory.", 404

@app.route("/api/alert/send", methods=["POST"])
def send_alert_api():
    """API endpoint for sending alerts via Novu"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        device_id = data.get("deviceId")
        severity = data.get("severity", "medium")
        
        if not device_id:
            return jsonify({"error": "Device ID is required"}), 400
        
        # Create mock device data without database check
        mock_device_data = {
            "id": device_id,
            "NAME": f"Device {device_id}",
            "MANUFACTURER_NAME": "Test Manufacturer",
            "CLASSIFICATION": "Medical Device",
            "COUNTRY": "Test Location"
        }
        
        # Create mock prediction data
        mock_prediction = {
            "failure_prediction": 1 if severity == "high" else 0,
            "risk_percentage": "85.5" if severity == "high" else "25.0",
            "within_50_days": "Yes" if severity == "high" else "No"
        }
        
        print(f"📧 Sending alert for Device {device_id} with severity {severity}")
        print(f"📦 Mock Device Data: {mock_device_data}")
        print(f"🔮 Mock Prediction: {mock_prediction}")
        
        # Send alert via Novu
        novu_result = send_novu_alert(mock_device_data, mock_prediction, severity)
        
        if novu_result["success"]:
            return jsonify({
                "success": True,
                "message": "Alert sent successfully via Novu",
                "deviceId": device_id,
                "timestamp": datetime.now().isoformat(),
                "novuData": novu_result["data"]
            })
        else:
            return jsonify({
                "success": False,
                "error": novu_result["error"],
                "deviceId": device_id
            }), 500
            
    except Exception as e:
        print(f"API alert error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


def send_novu_alert(device, prediction, severity):
    """Send alert via Novu platform"""
    try:
        # Novu API configuration from config.py
        novu_api_key = NOVU_API_KEY
        novu_base_url = NOVU_BASE_URL
        novu_workflow = NOVU_WORKFLOW_ID
        novu_subscriber = NOVU_SUBSCRIBER_ID
        novu_email = NOVU_SUBSCRIBER_EMAIL
        
        print(f"🔧 Novu Configuration:")
        print(f"   API Key: {novu_api_key[:10]}...{novu_api_key[-4:] if len(novu_api_key) > 14 else '***'}")
        print(f"   Base URL: {novu_base_url}")
        print(f"   Workflow: {novu_workflow}")
        print(f"   Subscriber: {novu_subscriber}")
        print(f"   Email: {novu_email}")
        
        # Get device ID properly
        device_id = device.get("id") or device.get("ID") or device.get("device_id")
        if not device_id:
            print("❌ ERROR: No device ID found in device data")
            return {
                "success": False,
                "error": "Device ID not found in device data"
            }
        
        # Prepare the notification payload
        payload = {
            "name": novu_workflow,  # Novu workflow name from config
            "to": {
                "subscriberId": novu_subscriber,  # Subscriber ID from config
                "email": novu_email  # Email address for the subscriber
            },
            "payload": {
                "deviceId": str(device_id),
                "deviceName": device.get("NAME") or device.get("name", "Unknown Device"),
                "manufacturer": device.get("MANUFACTURER_NAME") or device.get("manufacturer", "Unknown"),
                "deviceType": device.get("CLASSIFICATION") or device.get("type", "Medical Device"),
                "location": device.get("COUNTRY") or device.get("location", "Unknown"),
                "riskLevel": "High" if prediction and prediction.get("failure_prediction") == 1 else "Low",
                "riskPercentage": prediction.get("risk_percentage", "N/A") if prediction else "N/A",
                "within50Days": prediction.get("within_50_days", "Unknown") if prediction else "N/A",
                "severity": severity,
                "alertTime": datetime.now().isoformat(),
                "reportUrl": f"http://127.0.0.1:5000/report/{device_id}",
                "subscriberEmail": novu_email
            }
        }
        
        print(f"📦 Novu Payload:")
        print(f"   Workflow: {payload['name']}")
        print(f"   Subscriber: {payload['to']['subscriberId']}")
        print(f"   Email: {payload['to']['email']}")
        print(f"   Device ID: {payload['payload']['deviceId']}")
        print(f"   Device: {payload['payload']['deviceName']}")
        print(f"   Risk: {payload['payload']['riskLevel']}")
        print(f"   Report URL: {payload['payload']['reportUrl']}")
        
        # Send request to Novu
        headers = {
            'Authorization': f'ApiKey {novu_api_key}',
            'Content-Type': 'application/json'
        }
        
        print(f"📡 Sending request to: {novu_base_url}/events/trigger")
        
        response = requests.post(
            f"{novu_base_url}/events/trigger",
            json=payload,
            headers=headers,
            timeout=30
        )
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 201 or response.status_code == 200:
            result = response.json()
            print(f"✅ SUCCESS: {result}")
            return {
                "success": True,
                "data": result,
                "message": "Alert sent successfully via Novu"
            }
        else:
            error_msg = f"Novu API error: {response.status_code}"
            try:
                error_data = response.json()
                print(f"❌ Error Response: {error_data}")
                if 'message' in error_data:
                    error_msg = error_data['message']
                elif 'error' in error_data:
                    error_msg = error_data['error']
            except:
                print(f"❌ Raw Error Response: {response.text}")
                pass
            
            return {
                "success": False,
                "error": error_msg
            }
            
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT: Request timeout - Novu service not responding")
        return {
            "success": False,
            "error": "Request timeout - Novu service not responding"
        }
    except requests.exceptions.RequestException as e:
        print(f"❌ NETWORK ERROR: {str(e)}")
        return {
            "success": False,
            "error": f"Network error: {str(e)}"
        }
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")
        return {
            "success": False,
            "error": f"Unexpected error: {str(e)}"
        }


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

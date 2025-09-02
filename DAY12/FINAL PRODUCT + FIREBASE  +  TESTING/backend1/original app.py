from flask import Flask, jsonify, request
from flask_cors import CORS
import snowflake.connector
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Snowflake connection parameters
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
        return jsonify({"devices": []}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

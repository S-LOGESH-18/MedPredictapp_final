from flask import Flask, jsonify, request
from flask_cors import CORS
import snowflake.connector
import pandas as pd
import os
import json
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

# CSV data paths (fallback)
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATHS = {
    "device_events": os.path.join(BACKEND_DIR, "devicepreprocessed.csv"),
    "final": os.path.join(BACKEND_DIR, "final_preprocessed.csv"),
    "manufacturer": os.path.join(BACKEND_DIR, "manufacturer.csv")
}

# Global DataFrames for CSV fallback
csv_data = {}

def _safe_read_csv(path: str) -> pd.DataFrame:
    """Safely read CSV with multiple encoding attempts."""
    if not os.path.exists(path):
        return pd.DataFrame()
    try:
        return pd.read_csv(path, low_memory=False, encoding="utf-8")
    except UnicodeDecodeError:
        try:
            return pd.read_csv(path, low_memory=False, encoding="latin-1")
        except:
            return pd.read_csv(path, low_memory=False, encoding="cp1252")

def _load_csv_data():
    """Load all CSV data into memory for fallback."""
    global csv_data
    if not csv_data:
        csv_data = {
            "device_events": _safe_read_csv(CSV_PATHS["device_events"]),
            "final": _safe_read_csv(CSV_PATHS["final"]),
            "manufacturer": _safe_read_csv(CSV_PATHS["manufacturer"])
        }
        # Normalize column names
        for key, df in csv_data.items():
            if not df.empty:
                df.columns = [str(c).strip().lower() for c in df.columns]

def _to_records(df: pd.DataFrame):
    """Convert DataFrame to JSON-serializable records."""
    if df is None or df.empty:
        return []
    return [
        {k: (None if pd.isna(v) else (v.item() if hasattr(v, "item") else v)) 
         for k, v in row.items()}
        for row in df.to_dict(orient="records")
    ]

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

def search_device_csv(device_id):
    """Search device data in CSV files."""
    _load_csv_data()
    
    # Normalize device_id for comparison
    try:
        device_id_num = int(str(device_id).strip())
    except ValueError:
        device_id_num = None
    
    device_id_str = str(device_id).strip()
    
    # Search in device_events (primary events data)
    events_match = pd.DataFrame()
    if not csv_data["device_events"].empty:
        df = csv_data["device_events"]
        device_cols = [c for c in ["device_id", "id", "deviceid"] if c in df.columns]
        if device_cols:
            col = device_cols[0]
            mask_str = df[col].astype(str).str.strip() == device_id_str
            if device_id_num is not None:
                mask_num = pd.to_numeric(df[col], errors="coerce") == device_id_num
                events_match = df[mask_str | mask_num]
            else:
                events_match = df[mask_str]
    
    # Search in final dataset (device details)
    device_match = pd.DataFrame()
    if not csv_data["final"].empty:
        df = csv_data["final"]
        device_cols = [c for c in ["device_id", "id", "deviceid"] if c in df.columns]
        if device_cols:
            col = device_cols[0]
            mask_str = df[col].astype(str).str.strip() == device_id_str
            if device_id_num is not None:
                mask_num = pd.to_numeric(df[col], errors="coerce") == device_id_num
                device_match = df[mask_str | mask_num]
            else:
                device_match = df[mask_str]
    
    # Collect manufacturer IDs
    manu_ids = set()
    for df in [events_match, device_match]:
        if not df.empty:
            manu_cols = [c for c in ["manufacturer_id", "manufacturerid", "manu_id", "manufacturer", "mfr_id"] if c in df.columns]
            if manu_cols:
                col = manu_cols[0]
                manu_ids.update(df[col].dropna().astype(str).str.strip().tolist())
    
    # Get manufacturer/company data
    companies = []
    if manu_ids and not csv_data["manufacturer"].empty:
        manu_df = csv_data["manufacturer"]
        key_cols = [c for c in ["id", "manufacturer_id"] if c in manu_df.columns]
        if key_cols:
            key = key_cols[0]
            manu_df["__key_str__"] = manu_df[key].astype(str).str.strip()
            companies = manu_df[manu_df["__key_str__"].isin(manu_ids)].drop(columns=["__key_str__"], errors="ignore")
    
    return {
        "device": _to_records(device_match if not device_match.empty else events_match.drop_duplicates()),
        "events": _to_records(events_match),
        "companies": _to_records(companies),
        "manufacturers": _to_records(companies)  # For compatibility
    }

@app.route("/api/device/<string:device_id>", methods=["GET"])
def get_device_details(device_id):
    """Get device details from Snowflake with CSV fallback."""
    
    # Try Snowflake first
    try:
        # Get device details from DEVICE table
        devices = fetch_snowflake_data(
            "SELECT * FROM DEVICE WHERE ID = TRY_TO_NUMBER(%s)",
            (device_id,)
        )
        
        # Get related events from EVENTS table
        events = fetch_snowflake_data(
            "SELECT * FROM EVENTS WHERE DEVICE_ID = TRY_TO_NUMBER(%s)", 
            (device_id,)
        )
        
        # Collect manufacturer IDs from both device and events
        manu_ids = set()
        for d in (devices or []):
            if d.get("MANUFACTURER_ID") is not None:
                manu_ids.add(d["MANUFACTURER_ID"])
        for e in (events or []):
            if e.get("MANUFACTURER_ID") is not None:
                manu_ids.add(e["MANUFACTURER_ID"])
        
        # Get company data
        companies = []
        if manu_ids:
            placeholders = ",".join(["%s"] * len(manu_ids))
            company_query = f"SELECT * FROM COMPANY WHERE TRY_TO_NUMBER(ID) IN ({placeholders})"
            companies = fetch_snowflake_data(company_query, tuple(manu_ids))
        
        # If we got data from Snowflake, return it
        if devices or events:
            return jsonify({
                "device": devices or [],
                "events": events,
                "companies": companies,
                "manufacturers": companies,  # For compatibility
                "source": "snowflake"
            })
    
    except Exception as e:
        print(f"Snowflake lookup failed: {e}")
    
    # Fallback to CSV data
    try:
        csv_result = search_device_csv(device_id)
        if csv_result["device"] or csv_result["events"]:
            csv_result["source"] = "csv"
            return jsonify(csv_result)
    except Exception as e:
        print(f"CSV lookup failed: {e}")
    
    return jsonify({"error": "Device not found in any data source"}), 404

@app.route("/api/device/<string:device_id>/report", methods=["GET"])
def get_device_report(device_id):
    """Generate a simple HTML report for the device."""
    data = get_device_details(device_id)
    
    if isinstance(data, tuple):  # Error response
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
            <p>Data Source: {data.get('source', 'unknown')}</p>
        </div>
        
        <div class="section">
            <h2>Device Information</h2>
            {_generate_table_html(data.get('device', []))}
        </div>
        
        <div class="section">
            <h2>Related Events</h2>
            {_generate_table_html(data.get('events', []))}
        </div>
        
        <div class="section">
            <h2>Manufacturer/Company Information</h2>
            {_generate_table_html(data.get('companies', []))}
        </div>
    </body>
    </html>
    """
    
    return html

def _generate_table_html(data):
    """Generate HTML table from data."""
    if not data:
        return '<p class="no-data">No data available</p>'
    
    if not isinstance(data, list) or len(data) == 0:
        return '<p class="no-data">No data available</p>'
    
    columns = list(data[0].keys())
    html = '<table><thead><tr>'
    for col in columns:
        html += f'<th>{col}</th>'
    html += '</tr></thead><tbody>'
    
    for row in data:
        html += '<tr>'
        for col in columns:
            value = row.get(col, '')
            html += f'<td>{value}</td>'
        html += '</tr>'
    
    html += '</tbody></table>'
    return html

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "snowflake_connected": _test_snowflake_connection(),
        "csv_available": _test_csv_availability()
    })

def _test_snowflake_connection():
    """Test Snowflake connection."""
    try:
        fetch_snowflake_data("SELECT 1")
        return True
    except:
        return False

def _test_csv_availability():
    """Test CSV file availability."""
    return {name: os.path.exists(path) for name, path in CSV_PATHS.items()}

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

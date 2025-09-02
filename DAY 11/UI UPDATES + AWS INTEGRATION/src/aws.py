import os
import boto3
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# AWS S3 config
S3_BUCKET = "pdfstorageas"
S3_REGION = "us-east-1"   # Change to your region
AWS_ACCESS_KEY = "AKIAZKXSV2B5A5ZU7D66"
AWS_SECRET_KEY = "y3Er8dEwmt2fDipR6JtadHew/OeclsiOFkABU+nG"

# Initialize boto3 client
s3_client = boto3.client(
    "s3",
    region_name=S3_REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY
)

# ---- Test connection on startup ----
try:
    s3_client.head_bucket(Bucket=S3_BUCKET)  # Simple check if bucket is accessible
    print(f"✅ Successfully connected to S3 bucket: {S3_BUCKET} in {S3_REGION}")
except Exception as e:
    print(f"❌ Failed to connect to S3: {e}")


# Upload PDF
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


# List PDFs
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


if __name__ == "__main__":
    app.run(debug=True)

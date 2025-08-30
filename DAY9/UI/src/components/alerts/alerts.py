# app.py
from flask import Flask, request, jsonify
from twilio.rest import Client
import os

app = Flask(__name__)

# Twilio credentials (store these in environment variables in production)
TWILIO_ACCOUNT_SID = "ACc69ff6453d36288c47dc3d7ecfbf373"
TWILIO_AUTH_TOKEN = "19d0c55148a831d6e1e27282c49f06608"
TWILIO_PHONE_NUMBER = "+1234567890"  # Replace with your Twilio number

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

@app.route("/send-alert", methods=["POST"])
def send_alert():
    try:
        data = request.json
        product_name = data.get("product_name", "Unknown Product")
        product_id = data.get("product_id", "N/A")
        risk_level = data.get("risk", "Not specified")
        pdf_link = data.get("pdf_link", "#")

        # SMS content
        message_body = f"""
🚨 ALERT: {product_name}
🆔 ID: {product_id}
⚠️ Risk Level: {risk_level}
📄 PDF Report: {pdf_link}
        """

        # Send SMS
        message = client.messages.create(
            body=message_body,
            from_=TWILIO_PHONE_NUMBER,
            to="+91 7810008757"  # replace with recipient number
        )

        return jsonify({"status": "success", "sid": message.sid}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True,port = 7000)

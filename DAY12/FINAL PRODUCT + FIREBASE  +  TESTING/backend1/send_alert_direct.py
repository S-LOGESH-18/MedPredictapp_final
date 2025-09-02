#!/usr/bin/env python3
"""
Direct Alert Sender
Send alerts directly with any device ID without database checks
"""

import requests
import json
from datetime import datetime

def send_direct_alert(device_id, severity="high"):
    """Send alert directly without database validation"""
    
    url = "http://127.0.0.1:5000/api/alert/send"
    
    payload = {
        "deviceId": str(device_id),
        "severity": severity
    }
    
    print(f"📧 Sending Direct Alert...")
    print(f"📡 Endpoint: {url}")
    print(f"📦 Payload: {json.dumps(payload, indent=2)}")
    print("-" * 50)
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS!")
            print(f"📄 Response: {json.dumps(result, indent=2)}")
            return True
        else:
            print("❌ FAILED!")
            print(f"📄 Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Make sure the Flask backend is running on port 5000")
        return False
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT: Request took too long")
        return False
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")
        return False

def test_multiple_devices():
    """Test sending alerts to multiple device IDs"""
    
    test_cases = [
        {"id": "123", "severity": "high"},
        {"id": "456", "severity": "medium"},
        {"id": "789", "severity": "high"},
        {"id": "ABC123", "severity": "medium"},
        {"id": "DEVICE_001", "severity": "high"}
    ]
    
    print("🧪 Testing Multiple Device IDs")
    print("=" * 50)
    
    success_count = 0
    total_count = len(test_cases)
    
    for test_case in test_cases:
        print(f"\n📱 Testing Device ID: {test_case['id']} (Severity: {test_case['severity']})")
        if send_direct_alert(test_case['id'], test_case['severity']):
            success_count += 1
        print("-" * 30)
    
    print(f"\n🏁 Test Results: {success_count}/{total_count} successful")
    
    if success_count == total_count:
        print("🎉 All alerts sent successfully!")
    else:
        print("⚠️ Some alerts failed. Check the backend logs.")

if __name__ == "__main__":
    print("🚀 Direct Alert Sender - No Database Required")
    print("=" * 50)
    
    # Option 1: Send single alert
    print("1️⃣ Single Alert Test")
    device_id = input("Enter Device ID (or press Enter for default 'TEST001'): ").strip()
    if not device_id:
        device_id = "TEST001"
    
    severity = input("Enter Severity (high/medium, or press Enter for 'high'): ").strip().lower()
    if severity not in ['high', 'medium']:
        severity = 'high'
    
    print(f"\n📧 Sending alert for Device {device_id} with {severity} severity...")
    send_direct_alert(device_id, severity)
    
    # Option 2: Test multiple devices
    print(f"\n2️⃣ Multiple Device Test")
    run_multiple = input("Run multiple device test? (y/n, or press Enter for 'y'): ").strip().lower()
    if run_multiple in ['', 'y', 'yes']:
        test_multiple_devices()
    
    print("\n📝 Next Steps:")
    print("1. Check your email for notifications")
    print("2. Check Novu dashboard for delivery status")
    print("3. Check backend logs for detailed information")

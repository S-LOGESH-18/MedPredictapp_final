#!/usr/bin/env python3
"""
Test script for Novu integration
Run this to test if the Novu alert functionality works correctly
"""

import requests
import json
from datetime import datetime

def test_novu_alert():
    """Test the Novu alert endpoint"""
    
    # Test data - using a valid device ID
    test_device_id = "1"  # Use a device ID that exists in your database
    
    # Test the API endpoint
    url = "http://127.0.0.1:5000/api/alert/send"
    
    payload = {
        "deviceId": test_device_id,
        "severity": "high"
    }
    
    print("🧪 Testing Novu Alert Integration...")
    print(f"📡 Endpoint: {url}")
    print(f"📦 Payload: {json.dumps(payload, indent=2)}")
    print("-" * 50)
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS!")
            print(f"📄 Response: {json.dumps(result, indent=2)}")
        else:
            print("❌ FAILED!")
            print(f"📄 Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Make sure the Flask backend is running on port 5000")
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT: Request took too long")
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")

def test_report_page():
    """Test if the report page loads correctly"""
    
    # Use a valid device ID
    device_id = "1"
    url = f"http://127.0.0.1:5000/report/{device_id}"
    
    print("\n🧪 Testing Report Page...")
    print(f"📡 URL: {url}")
    print("-" * 50)
    
    try:
        response = requests.get(url, timeout=30)
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: Report page loaded")
            
            # Check if Novu button is present
            if "Send Alert via Novu" in response.text:
                print("✅ SUCCESS: Novu alert button found")
            else:
                print("❌ FAILED: Novu alert button not found")
                
            # Check if JavaScript function is present
            if "sendNovuAlert" in response.text:
                print("✅ SUCCESS: sendNovuAlert function found")
            else:
                print("❌ FAILED: sendNovuAlert function not found")
                
        else:
            print("❌ FAILED!")
            print(f"📄 Response: {response.text[:200]}...")
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Make sure the Flask backend is running on port 5000")
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")

def test_device_data():
    """Test if device data can be fetched"""
    
    device_id = "1"
    url = f"http://127.0.0.1:5000/api/device/{device_id}"
    
    print("\n🧪 Testing Device Data Fetch...")
    print(f"📡 URL: {url}")
    print("-" * 50)
    
    try:
        response = requests.get(url, timeout=30)
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS: Device data fetched")
            print(f"📄 Device Info: {json.dumps(result, indent=2)}")
        else:
            print("❌ FAILED!")
            print(f"📄 Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Make sure the Flask backend is running on port 5000")
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")

if __name__ == "__main__":
    print("🚀 PredictApp Novu Integration Test")
    print("=" * 50)
    
    # Test 1: Device Data Fetch
    test_device_data()
    
    # Test 2: Novu Alert API
    test_novu_alert()
    
    # Test 3: Report Page
    test_report_page()
    
    print("\n" + "=" * 50)
    print("🏁 Test completed!")
    print("\n📝 Next Steps:")
    print("1. Check if the Flask backend is running")
    print("2. Verify Novu API key in config.py")
    print("3. Test the full flow in the browser")
    print("4. Check Novu dashboard for notifications")
    print("\n🔧 Configuration Check:")
    print("- Workflow: medpredict")
    print("- Subscriber: 68a9b02f064b1af91d47d8b1")
    print("- Email: 727722euai032@skcet.ac.in")
    print("\n🚀 NEW: Direct Alert Testing (No Database Required)")
    print("- Use send_alert_direct.py for command line testing")
    print("- Visit http://127.0.0.1:5000/test-alert for web testing")
    print("- Any device ID will work - no validation needed!")

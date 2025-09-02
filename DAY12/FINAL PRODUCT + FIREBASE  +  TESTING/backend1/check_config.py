#!/usr/bin/env python3
"""
Check Novu Configuration
Run this to verify your current Novu configuration
"""

try:
    from config import *
    
    print("🔧 Novu Configuration Check")
    print("=" * 40)
    print(f"API Key: {NOVU_API_KEY[:10]}...{NOVU_API_KEY[-4:] if len(NOVU_API_KEY) > 14 else '***'}")
    print(f"Base URL: {NOVU_BASE_URL}")
    print(f"Workflow: {NOVU_WORKFLOW_ID}")
    print(f"Subscriber ID: {NOVU_SUBSCRIBER_ID}")
    print(f"Subscriber Email: {NOVU_SUBSCRIBER_EMAIL}")
    print("=" * 40)
    
    # Check if values are set
    if NOVU_API_KEY and NOVU_API_KEY != 'your-novu-api-key':
        print("✅ API Key: Set")
    else:
        print("❌ API Key: Not set or using default")
        
    if NOVU_WORKFLOW_ID and NOVU_WORKFLOW_ID != 'device-failure-alert':
        print("✅ Workflow: Set")
    else:
        print("❌ Workflow: Not set or using default")
        
    if NOVU_SUBSCRIBER_ID and len(NOVU_SUBSCRIBER_ID) > 10:
        print("✅ Subscriber ID: Set (UUID format)")
    else:
        print("❌ Subscriber ID: Not set or invalid format")
        
    if NOVU_SUBSCRIBER_EMAIL and '@' in NOVU_SUBSCRIBER_EMAIL:
        print("✅ Subscriber Email: Set")
    else:
        print("❌ Subscriber Email: Not set or invalid format")
        
    print("\n📝 Next Steps:")
    print("1. Make sure all values are set correctly")
    print("2. Verify workflow exists in Novu dashboard")
    print("3. Test the integration with: python test_novu.py")
    
except ImportError as e:
    print(f"❌ Error importing config: {e}")
    print("Make sure you're in the backend directory")
except Exception as e:
    print(f"❌ Unexpected error: {e}")

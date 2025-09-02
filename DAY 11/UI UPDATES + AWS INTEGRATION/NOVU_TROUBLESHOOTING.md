# Novu Troubleshooting Guide

## Common Error: "workflow_not_found"

### What This Error Means
The error `"workflow_not_found"` means that the workflow name specified in your configuration doesn't exist in your Novu account.

### How to Fix

#### Option 1: Use Existing Workflow
1. **Check your Novu dashboard** for existing workflows
2. **Update `backend/config.py`** with the correct workflow name:

```python
# Find the exact workflow name from your Novu dashboard
NOVU_WORKFLOW_ID = 'medpredict'  # or whatever your workflow is called
```

#### Option 2: Create New Workflow
1. **Go to [Novu Dashboard](https://web.novu.co/)**
2. **Click "Create Workflow"**
3. **Name it exactly** as specified in your config (e.g., `medpredict`)
4. **Configure notification channels** (email, SMS, etc.)
5. **Save the workflow**

#### Option 3: Check Workflow Names
1. **In Novu dashboard**, go to "Workflows"
2. **Look for exact names** (case-sensitive)
3. **Copy the exact name** to your config

### Current Configuration
Your current config uses:
- **Workflow**: `medpredict`
- **Subscriber**: `logesh.s0409@gmail.com`
- **Email**: `logesh.s0409@gmail.com`

### Quick Test
Run this command to test your current setup:

```bash
cd backend
python test_novu.py
```

## Other Common Issues

### 1. Invalid API Key
**Error**: `"Invalid API key"` or `"Unauthorized"`
**Fix**: 
- Check your API key in `backend/config.py`
- Verify the key in your Novu dashboard
- Make sure there are no extra spaces

### 2. Subscriber Not Found
**Error**: `"subscriber_not_found"`
**Fix**:
- Check subscriber ID in your config
- Create the subscriber in Novu dashboard
- Use the correct subscriber ID format

### 3. Network Issues
**Error**: `"Request timeout"` or `"Network error"`
**Fix**:
- Check internet connection
- Verify Novu service status
- Check firewall settings

## Debug Steps

### 1. Check Backend Logs
When you send an alert, look for these debug messages in your terminal:

```
🔧 Novu Configuration:
   API Key: d1e3f13b5...abfa
   Base URL: https://api.novu.co/v1
   Workflow: medpredict
   Subscriber: 68a9b02f064b1af91d47d8b1
   Email: 727722euai032@skcet.ac.in
📦 Novu Payload:
   Workflow: medpredict
   Subscriber: 68a9b02f064b1af91d47d8b1
   Email: 727722euai032@skcet.ac.in
   Device ID: [Device ID]
   Device: [Device Name]
   Risk: High
   Report URL: http://127.0.0.1:5000/report/[Device ID]
📡 Sending request to: https://api.novu.co/v1/events/trigger
📊 Response Status: [Status Code]
```

### 2. Test Novu API Directly
Use curl to test your Novu setup:

```bash
curl -X POST https://api.novu.co/v1/events/trigger \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "medpredict",
    "to": {
      "subscriberId": "68a9b02f064b1af91d47d8b1",
      "email": "727722euai032@skcet.ac.in"
    },
    "payload": {"test": "data"}
  }'
```

### 3. Check Novu Dashboard
1. **Verify workflow exists** with exact name
2. **Check subscriber exists** with correct ID
3. **Ensure workflow is active** (not paused)
4. **Check notification channels** are configured

## Configuration Checklist

- [ ] API Key is correct and active
- [ ] Workflow name matches exactly (case-sensitive)
- [ ] Subscriber ID exists in Novu
- [ ] Workflow is active and configured
- [ ] Notification channels are set up
- [ ] Backend is running and accessible

## Still Having Issues?

1. **Check Novu Status**: [https://status.novu.co/](https://status.novu.co/)
2. **Review Novu Docs**: [https://docs.novu.co/](https://docs.novu.co/)
3. **Check Backend Logs** for detailed error messages
4. **Verify Network** connectivity to `api.novu.co`

## Quick Fix Commands

```bash
# Restart backend with debug logging
cd backend
python app.py

# Test the integration
python test_novu.py

# Check configuration
python -c "from config import *; print(f'Workflow: {NOVU_WORKFLOW_ID}'); print(f'Subscriber: {NOVU_SUBSCRIBER_ID}')"
```

# Novu Integration for Device Failure Alerts

This document explains how to set up and use the Novu platform integration for sending device failure alerts in the PredictApp.

## Overview

After a device failure prediction is made, users can now:
1. View the full report with prediction results
2. Send alerts via Novu platform to notify relevant stakeholders
3. Track alert status and delivery confirmation

## Setup Instructions

### 1. Novu Platform Setup

1. Create an account at [Novu](https://novu.co/)
2. Create a new workflow called `medpredict` (or use existing workflow)
3. Configure the workflow with your preferred notification channels (email, SMS, push, etc.)
4. Get your API key from the Novu dashboard

### 2. Configuration

Update the `backend/config.py` file with your Novu credentials:

```python
# Novu Configuration
NOVU_API_KEY = 'your-actual-novu-api-key'
NOVU_BASE_URL = 'https://api.novu.co/v1'
NOVU_WORKFLOW_ID = 'medpredict'
NOVU_SUBSCRIBER_ID = '68a9b02f064b1af91d47d8b1'
NOVU_SUBSCRIBER_EMAIL = '727722euai032@skcet.ac.in'
```

### 3. Environment Variables (Optional)

You can also set environment variables:

```bash
export NOVU_API_KEY="your-api-key"
export NOVU_BASE_URL="https://api.novu.co/v1"
export NOVU_WORKFLOW_ID="medpredict"
export NOVU_SUBSCRIBER_ID="68a9b02f064b1af91d47d8b1"
export NOVU_SUBSCRIBER_EMAIL="727722euai032@skcet.ac.in"
```

## How It Works

### 1. Prediction Flow

1. User runs device analysis
2. System shows prediction results
3. User clicks "View Report" to see full details
4. Report page displays prediction, device info, and manufacturer details

### 2. Alert Flow

1. In the report page, user clicks "📧 Send Alert via Novu"
2. Frontend calls `/api/alert/send` endpoint
3. Backend processes the request and calls Novu API
4. Alert status is displayed to user
5. Novu sends notifications to configured channels

### 3. Alert Payload

The alert includes:
- Device ID and name
- Manufacturer information
- Risk level (High/Low)
- Risk percentage
- Time to failure prediction
- Report URL for detailed information

## API Endpoints

### POST /api/alert/send

Sends an alert via Novu for a specific device.

**Request Body:**
```json
{
  "deviceId": "123",
  "severity": "high"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Alert sent successfully via Novu",
  "deviceId": "123",
  "timestamp": "2024-01-15T10:30:00Z",
  "novuData": { ... }
}
```

## Frontend Changes

### DeviceAnalysis Component

- Removed old alert buttons
- Now only shows "View Report" option after prediction
- Alerts are handled through the report page

### Report Page

- Added "📧 Send Alert via Novu" button
- Real-time alert status display
- Success/error feedback with auto-hide

## Backend Changes

### Report Generation

- Modified `_render_report_html` function
- Added Novu alert button with JavaScript functionality
- Integrated with existing prediction display

### Novu Service

- Enhanced `send_novu_alert` function
- Better error handling and timeout management
- Configuration-driven approach

## Testing

### 1. Test Prediction

1. Run device analysis
2. Verify prediction results are displayed
3. Click "View Report"

### 2. Test Alert

1. In report page, click "📧 Send Alert via Novu"
2. Verify alert status is displayed
3. Check Novu dashboard for notification delivery

### 3. Test Error Handling

1. Use invalid API key
2. Test network timeouts
3. Verify error messages are displayed

## Troubleshooting

### Common Issues

1. **Alert not sending**: Check Novu API key and workflow name
2. **Network errors**: Verify internet connection and Novu service status
3. **Configuration errors**: Ensure all config values are set correctly

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify backend logs for API call details
3. Test Novu API directly with curl or Postman

## Security Considerations

1. API keys are stored in configuration files (not in version control)
2. Use environment variables for production deployments
3. Implement rate limiting for alert endpoints
4. Validate device ID and user permissions before sending alerts

## Future Enhancements

1. **Alert Templates**: Customizable notification content
2. **Alert History**: Track all sent alerts
3. **User Preferences**: Allow users to configure notification channels
4. **Escalation Rules**: Automatic escalation for high-risk devices
5. **Integration**: Connect with other notification platforms

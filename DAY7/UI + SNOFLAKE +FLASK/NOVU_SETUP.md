# Novu Integration Setup Guide

This guide explains how to set up Novu notifications for the Medical Device Failure Prediction System.

## What is Novu?

[Novu](https://novu.co/) is an open-source notification infrastructure that provides a complete solution for managing multi-channel notifications. It offers:

- **Multi-channel delivery**: Email, SMS, Push, Chat, and more
- **In-app notifications**: Built-in notification center
- **Workflow orchestration**: Complex notification workflows
- **Real-time delivery**: Instant notification delivery
- **Developer-friendly**: Easy integration with React applications

## Features Implemented

### 1. Device Risk Alerts
- **Critical Device Alerts**: For devices with high risk of failure
- **Performance Warnings**: For devices showing degradation
- **Manufacturer Alerts**: For manufacturer performance issues

### 2. Notification Types
- **Device Risk Alert**: Sent when devices are at risk
- **Critical Device Alert**: Sent for critical device failures
- **Manufacturer Performance Alert**: Sent for manufacturer issues

### 3. Alert Button Integration
- **Device Analysis**: Alert button on each device card
- **Manufacturers**: Alert button on each manufacturer card
- **Visual Feedback**: Loading states, success/error indicators

## Setup Instructions

### Step 1: Create Novu Account

1. Go to [https://novu.co/](https://novu.co/)
2. Click "Start for Free"
3. Create your account
4. Complete the onboarding process

### Step 2: Get API Key

1. In your Novu dashboard, go to **Settings** → **API Keys**
2. Copy your **API Key**
3. Keep this key secure - it will be used to send notifications

### Step 3: Configure Environment Variables

Create a `.env` file in your project root:

```env
REACT_APP_NOVU_API_KEY=your_novu_api_key_here
REACT_APP_NOVU_SUBSCRIBER_ID=device-monitor-system
```

### Step 4: Create Notification Templates

In your Novu dashboard, create the following notification templates:

#### 1. Device Risk Alert Template
- **Name**: `device-risk-alert`
- **Type**: Multi-channel
- **Channels**: Email, In-app
- **Subject**: `Device Risk Alert: {{deviceName}}`
- **Content**: 
```
Device: {{deviceName}}
Type: {{deviceType}}
Risk Level: {{riskLevel}}
Performance: {{performance}}%
Status: {{status}}
Action Required: {{actionRequired}}
```

#### 2. Critical Device Alert Template
- **Name**: `critical-device-alert`
- **Type**: Multi-channel
- **Channels**: Email, SMS, In-app
- **Subject**: `🚨 CRITICAL: {{deviceName}} Failure Imminent`
- **Content**:
```
🚨 CRITICAL DEVICE ALERT 🚨

Device: {{deviceName}}
Type: {{deviceType}}
Risk Level: {{riskLevel}}
Performance: {{performance}}%
Predicted Failure: {{predictedFailureTime}}

RECOMMENDED ACTIONS:
{{#each recommendedActions}}
• {{this}}
{{/each}}

IMMEDIATE ACTION REQUIRED
```

#### 3. Manufacturer Performance Alert Template
- **Name**: `manufacturer-performance-alert`
- **Type**: Multi-channel
- **Channels**: Email, In-app
- **Subject**: `Manufacturer Alert: {{manufacturerName}}`
- **Content**:
```
Manufacturer: {{manufacturerName}}
Device Count: {{deviceCount}}
Performance: {{performance}}%
Active Alerts: {{activeAlerts}}
Status: {{status}}

Action Required: {{actionRequired}}
```

### Step 5: Test the Integration

1. Start your React application:
   ```bash
   npm start
   ```

2. Navigate to the Device Analysis page

3. Click the alert button on any device card

4. Check your Novu dashboard for the notification

5. Verify the notification appears in the notification center

## Usage

### Sending Device Alerts

1. **Navigate to Device Analysis**
   - Go to `/dashboard/analysis`

2. **Identify Risky Devices**
   - Look for devices with "High" risk level or "critical" status
   - These will show a red alert triangle icon

3. **Send Alert**
   - Click the alert button on the device card
   - The button will show loading state while sending
   - Success/error feedback will be displayed

### Sending Manufacturer Alerts

1. **Navigate to Manufacturers**
   - Go to `/dashboard/manufacturers`

2. **Identify Issues**
   - Look for manufacturers with "critical" status
   - These will show a red alert triangle icon

3. **Send Alert**
   - Click the alert button on the manufacturer card
   - Follow the same process as device alerts

### Viewing Notifications

1. **Open Notification Center**
   - Click the bell icon in the top navigation
   - The notification center will slide in from the right

2. **Filter Notifications**
   - Use "All" or "Unread" filters
   - Click "Mark all read" to mark all as read

3. **Manage Notifications**
   - Click on notifications to mark as read
   - Use the trash icon to delete notifications

## Customization

### Adding New Alert Types

1. **Create Template in Novu**
   - Add new template in Novu dashboard
   - Configure channels and content

2. **Update Service**
   - Add new method in `novuService.js`
   - Follow the existing pattern

3. **Update Components**
   - Add alert buttons where needed
   - Update UI to handle new alert types

### Customizing Notification Content

1. **Edit Templates**
   - Modify templates in Novu dashboard
   - Use variables like `{{deviceName}}`, `{{riskLevel}}`

2. **Add Custom Fields**
   - Update the payload in service methods
   - Add new variables to templates

### Styling

The notification center uses Tailwind CSS classes and can be customized:

- **Colors**: Modify color classes in `NovuNotificationCenter.js`
- **Layout**: Adjust spacing and sizing classes
- **Animations**: Modify Framer Motion animations

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify the API key is correct
   - Check that the key has proper permissions
   - Ensure the environment variable is set correctly

2. **Notifications Not Sending**
   - Check browser console for errors
   - Verify network connectivity
   - Check Novu dashboard for failed deliveries

3. **Template Not Found**
   - Ensure template names match exactly
   - Check that templates are published in Novu
   - Verify template variables are correct

### Debug Mode

Enable debug logging by adding to your `.env`:

```env
REACT_APP_DEBUG_NOVU=true
```

This will log all Novu API calls to the console.

## Production Deployment

### Environment Variables

For production, set these environment variables:

```env
REACT_APP_NOVU_API_KEY=your_production_api_key
REACT_APP_NOVU_SUBSCRIBER_ID=your_production_subscriber_id
REACT_APP_NOVU_ENVIRONMENT=production
```

### Security Considerations

1. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables for all sensitive data
   - Rotate API keys regularly

2. **Rate Limiting**
   - Implement rate limiting for alert buttons
   - Prevent spam alerts

3. **Error Handling**
   - Implement proper error handling
   - Log errors for debugging
   - Provide user feedback for failures

## Support

- **Novu Documentation**: [https://docs.novu.co/](https://docs.novu.co/)
- **Novu Community**: [https://discord.gg/novu](https://discord.gg/novu)
- **GitHub Issues**: Report bugs in the project repository

## License

This integration is part of the Medical Device Failure Prediction System and follows the same license terms.

// Novu Service for Device Risk Alerts
// This service handles sending notifications when devices are at risk

class NovuService {
  constructor() {
    // Initialize Novu configuration
    this.subscriberId = 'device-monitor-system';
    this.apiKey = process.env.REACT_APP_NOVU_API_KEY || 'your-novu-api-key';
    this.baseUrl = 'https://api.novu.co/v1';
  }

  // Send device risk alert notification
  async sendDeviceRiskAlert(deviceData) {
    try {
      const notificationData = {
        name: 'device-risk-alert',
        to: {
          subscriberId: this.subscriberId,
        },
        payload: {
          deviceId: deviceData.id,
          deviceName: deviceData.name,
          deviceType: deviceData.type,
          riskLevel: deviceData.riskLevel,
          performance: deviceData.performance,
          status: deviceData.status,
          lastCheck: deviceData.lastCheck,
          manufacturer: deviceData.manufacturer || 'Unknown',
          location: deviceData.location || 'Unknown',
          alertTime: new Date().toISOString(),
          priority: this.getPriorityLevel(deviceData.riskLevel),
          actionRequired: this.getActionRequired(deviceData.riskLevel)
        }
      };

      const response = await fetch(`${this.baseUrl}/events/trigger`, {
        method: 'POST',
        headers: {
          'Authorization': `ApiKey ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      if (!response.ok) {
        throw new Error(`Novu API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Device risk alert sent successfully:', result);
      return result;

    } catch (error) {
      console.error('Error sending device risk alert:', error);
      throw error;
    }
  }

  // Send critical device failure prediction
  async sendCriticalDeviceAlert(deviceData) {
    try {
      const notificationData = {
        name: 'critical-device-alert',
        to: {
          subscriberId: this.subscriberId,
        },
        payload: {
          deviceId: deviceData.id,
          deviceName: deviceData.name,
          deviceType: deviceData.type,
          riskLevel: deviceData.riskLevel,
          performance: deviceData.performance,
          predictedFailureTime: deviceData.predictedFailureTime || 'Within 24 hours',
          recommendedActions: deviceData.recommendedActions || [
            'Immediate maintenance required',
            'Contact manufacturer support',
            'Prepare replacement device'
          ],
          alertTime: new Date().toISOString(),
          priority: 'critical',
          actionRequired: 'Immediate attention required'
        }
      };

      const response = await fetch(`${this.baseUrl}/events/trigger`, {
        method: 'POST',
        headers: {
          'Authorization': `ApiKey ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      if (!response.ok) {
        throw new Error(`Novu API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Critical device alert sent successfully:', result);
      return result;

    } catch (error) {
      console.error('Error sending critical device alert:', error);
      throw error;
    }
  }

  // Send manufacturer performance alert
  async sendManufacturerAlert(manufacturerData) {
    try {
      const notificationData = {
        name: 'manufacturer-performance-alert',
        to: {
          subscriberId: this.subscriberId,
        },
        payload: {
          manufacturerName: manufacturerData.name,
          deviceCount: manufacturerData.devices,
          performance: manufacturerData.performance,
          activeAlerts: manufacturerData.alerts,
          status: manufacturerData.status,
          lastUpdate: manufacturerData.lastUpdate,
          alertTime: new Date().toISOString(),
          priority: this.getPriorityLevel(manufacturerData.status),
          actionRequired: 'Review manufacturer performance'
        }
      };

      const response = await fetch(`${this.baseUrl}/events/trigger`, {
        method: 'POST',
        headers: {
          'Authorization': `ApiKey ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      if (!response.ok) {
        throw new Error(`Novu API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Manufacturer alert sent successfully:', result);
      return result;

    } catch (error) {
      console.error('Error sending manufacturer alert:', error);
      throw error;
    }
  }

  // Get priority level based on risk level
  getPriorityLevel(riskLevel) {
    switch (riskLevel.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'critical';
      case 'medium':
      case 'warning':
        return 'high';
      case 'low':
      case 'healthy':
        return 'normal';
      default:
        return 'normal';
    }
  }

  // Get action required based on risk level
  getActionRequired(riskLevel) {
    switch (riskLevel.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'Immediate attention required - Device at high risk of failure';
      case 'medium':
      case 'warning':
        return 'Schedule maintenance - Device showing warning signs';
      case 'low':
      case 'healthy':
        return 'Monitor - Device performing normally';
      default:
        return 'Review device status';
    }
  }

  // Simulate sending alert (for demo purposes when Novu is not configured)
  async simulateAlert(deviceData, alertType = 'risk') {
    console.log(`Simulating ${alertType} alert for device:`, deviceData);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: `${alertType} alert sent successfully for ${deviceData.name}`,
      timestamp: new Date().toISOString(),
      deviceId: deviceData.id
    };
  }
}

const novuService = new NovuService();
export default novuService;

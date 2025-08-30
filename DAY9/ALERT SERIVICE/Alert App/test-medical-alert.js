import { sendAlertNotification } from './services/notification.service.js';

async function testMedicalAlert() {
  try {
    console.log('Sending test medical equipment alert...');
    
    const result = await sendAlertNotification({
      message: "⚠️ Medical Equipment Requires Immediate Attention",
      priority: "High",
      equipment: {
        id: "VENT-ICU-05",
        name: "Ventilator",
        model: "V60 ResMed",
        location: "ICU Room 5, Bed 2",
        status: "Maintenance Required",
        lastMaintenance: "2025-07-15",
        nextMaintenance: "2025-09-15",
        serialNumber: "V60-87654-ICU05"
      },
      issue: {
        type: "Filter Replacement Needed",
        severity: "High",
        description: "HEPA filter has reached 98% of its service life. Immediate replacement recommended to maintain air quality standards.",
        reportedBy: "System Auto-Monitoring"
      },
      actionRequired: "Please replace HEPA filter within 24 hours and update maintenance records."
    });

    console.log('Test alert result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error sending test alert:', error);
  }
}

testMedicalAlert();

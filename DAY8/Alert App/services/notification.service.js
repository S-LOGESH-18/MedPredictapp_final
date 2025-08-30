import { Novu } from '@novu/node';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

// Load environment variables from .env file
dotenv.config({ path: join(process.cwd(), '.env') });

// Debug log to verify environment variables are loaded
console.log('Novu API Key:', process.env.NOVU_API_KEY ? 'Found' : 'Not found');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load JSON data
const loadJsonData = async (filename) => {
  try {
    const data = await fs.readFile(join(__dirname, '..', 'data', filename), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return null;
  }
};

// Get all alert receivers
const getAlertReceivers = async () => {
  const data = await loadJsonData('alert_receivers.json');
  return data?.receivers || [];
};

// Get product details by ID
const getProductDetails = async (productId) => {
  const data = await loadJsonData('product_details.json');
  return data?.products?.find(p => p.id === productId) || null;
};

// Initialize Novu with error handling
let novu;
const initNovu = () => {
  try {
    const apiKey = process.env.NOVU_API_KEY;
    if (!apiKey || apiKey === 'your_novu_api_key_here') {
      throw new Error('Invalid or missing NOVU_API_KEY in environment variables');
    }
    
    // Log first few characters of API key for debugging (don't log the full key)
    const maskedKey = apiKey.length > 8 
      ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
      : 'invalid';
    
    console.log(`Initializing Novu with API key: ${maskedKey}`);
    
    novu = new Novu(apiKey, {
      apiUrl: 'https://api.novu.co/v1',
      httpOptions: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    });
    
    console.log('Novu client initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Novu client:', error.message);
    throw error;
  }
};

// Initialize Novu when this module is loaded
initNovu();

/**
 * Send a medical equipment alert notification
 * @param {Object} alertData - The alert data
 * @param {string} alertData.message - The alert message
 * @param {Object} alertData.equipment - Equipment details
 * @param {string} alertData.equipment.id - Equipment ID
 * @param {string} alertData.equipment.name - Equipment name
 * @param {string} alertData.equipment.model - Equipment model
 * @param {string} alertData.equipment.location - Equipment location
 * @param {string} alertData.equipment.status - Current status
 * @param {string} [alertData.equipment.lastMaintenance] - Last maintenance date
 * @param {string} [alertData.equipment.nextMaintenance] - Next maintenance date
 * @param {string} [alertData.equipment.serialNumber] - Equipment serial number
 * @param {Object} alertData.issue - Issue details
 * @param {string} alertData.issue.type - Type of issue
 * @param {string} alertData.issue.severity - Severity level (High/Medium/Low)
 * @param {string} alertData.issue.description - Detailed description
 * @param {string} [alertData.issue.reportedBy] - Who reported the issue
 * @param {string} [alertData.actionRequired] - Required action
 * @param {string} [alertData.priority=Medium] - Alert priority (High/Medium/Low)
 * @returns {Promise<Object>} The notification result
 */
export const sendAlertNotification = async (alertData) => {
    const {
        message,
        equipment,
        issue,
        actionRequired = 'Please check the system for details',
        priority = 'Medium'
    } = alertData;
  try {
    // Get all alert receivers
    const receivers = await getAlertReceivers();

    // First, identify all subscribers
    const identifyPromises = receivers.map(receiver => 
      identifySubscriber({
        subscriberId: `user-${receiver.email}`,
        email: receiver.email,
        name: receiver.name
      })
    );

    await Promise.all(identifyPromises);

    // Then send notifications
    const notificationResults = await Promise.all(
      receivers.map(async (receiver) => {
        try {
          console.log(`Sending notification to ${receiver.email}...`);
          
          console.log('Sending notification to Novu...', {
            workflowId: 'medical-equipment-alert',
            subscriberId: `user-${receiver.email}`,
            email: receiver.email
          });
          
          const result = await novu.trigger('medical-equipment-alert', {
            to: {
              subscriberId: `user-${receiver.email}`,
              email: receiver.email
            }
            // },
            // payload: {
            //   alert: {
            //     message: message || 'Medical Equipment Alert',
            //     priority,
            //     timestamp: new Date().toISOString(),
            //     equipment: {
            //       id: equipment.id,
            //       name: equipment.name,
            //       model: equipment.model || 'N/A',
            //       location: equipment.location || 'Not specified',
            //       status: equipment.status || 'Alert',
            //       lastMaintenance: equipment.lastMaintenance || 'N/A',
            //       nextMaintenance: equipment.nextMaintenance || 'Not scheduled',
            //       serialNumber: equipment.serialNumber || 'N/A'
            //     },
            //     issue: {
            //       type: issue.type || 'General Alert',
            //       severity: issue.severity || 'Medium',
            //       description: issue.description || 'No additional details provided',
            //       reportedBy: issue.reportedBy || 'System'
            //     },
            //     actionRequired: actionRequired,
            //     recipient: {
            //       name: receiver.name,
            //       email: receiver.email,
            //       role: receiver.role || 'Staff'
            //     }
            //   }
            // }
          });
          
          console.log(`✅ Notification sent to ${receiver.email}:`, {
            transactionId: result.data?.transactionId,
            status: result.status,
            statusText: result.statusText,
            headers: result.headers,
            data: result.data
          });
          
          return {
            success: true,
            recipient: receiver.email,
            notificationId: result.data?.transactionId
          };
        } catch (error) {
          console.error(`❌ Error sending notification to ${receiver.email}:`, {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers
          });
          
          return {
            success: false,
            recipient: receiver.email,
            error: error.message,
            status: error.response?.status,
            response: error.response?.data
          };
        }
      })
    );

    // Check if all notifications were successful
    const allSuccessful = notificationResults.every(r => r.success);
    const failedRecipients = notificationResults
      .filter(r => !r.success)
      .map(r => r.recipient);

    return {
      success: allSuccessful,
      sentCount: notificationResults.filter(r => r.success).length,
      totalRecipients: notificationResults.length,
      failedRecipients,
      message: allSuccessful 
        ? 'All notifications sent successfully'
        : `Failed to send to ${failedRecipients.length} recipients`
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      success: false,
      error: error.message || 'Failed to send notification'
    };
  }
};

/**
 * Identify a subscriber in Novu
 * @param {Object} subscriber - The subscriber data
 * @param {string} subscriber.subscriberId - Unique ID for the subscriber
 * @param {string} [subscriber.email] - Subscriber's email
 * @param {string} [subscriber.phone] - Subscriber's phone number
 * @param {Object} [data] - Additional subscriber data
 * @returns {Promise<Object>} The identification result
 */
export const identifySubscriber = async (subscriber, data = {}) => {
  try {
    await novu.subscribers.identify(subscriber.subscriberId, {
      email: subscriber.email,
      phone: subscriber.phone,
      ...data
    });
    return { success: true };
  } catch (error) {
    console.error('Error identifying subscriber:', error);
    return { success: false, error: error.message };
  }
};

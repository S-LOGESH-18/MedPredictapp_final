import express from 'express';
import upload from '../middleware/upload.js';
import path from 'path';
import { sendAlertNotification, identifySubscriber } from '../services/notification.service.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Handle file upload
router.post('/send-alert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Please upload a PDF file' 
      });
    }

    const { message, productId } = req.body;
    
    // Send notification to all receivers
    const notificationResult = await sendAlertNotification({
      message: message || 'New alert received',
      productId: productId || null
    });
    
    if (!notificationResult.success) {
      console.warn('Notification failed but alert was still processed');
    }
    
    const responseData = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
      notification: {
        sent: notificationResult.success,
        id: notificationResult.notificationId
      }
    };
    
    // In a real application, you would store the alert in a database here
    
    res.status(200).json({
      status: 'success',
      message: 'Alert processed successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Error processing alert:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process alert',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

export default router;

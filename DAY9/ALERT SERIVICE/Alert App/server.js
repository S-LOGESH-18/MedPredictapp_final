import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import alertRoutes from './routes/alert.routes.js';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure upload directory exists
import { mkdir } from 'fs/promises';
try {
  await mkdir(UPLOAD_DIR, { recursive: true });
  console.log(`Upload directory ready: ${path.resolve(UPLOAD_DIR)}`);
} catch (err) {
  console.error('Error setting up upload directory:', err);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', UPLOAD_DIR)));

// API Routes
app.use('/api/alerts', alertRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      status: 'error',
      message: 'File too large. Maximum size is 5MB.'
    });
  }
  
  // Handle multer file type errors
  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
  
  res.status(500).json({ 
    status: 'error', 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Upload directory: ${path.resolve(__dirname, '..', UPLOAD_DIR)}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

export default app;

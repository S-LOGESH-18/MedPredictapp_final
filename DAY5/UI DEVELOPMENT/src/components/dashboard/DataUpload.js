import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  X,
  Download,
  Database,
  Cloud
} from 'lucide-react';

const DataUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload progress
    newFiles.forEach(file => {
      const interval = setInterval(() => {
        setUploadedFiles(prev => prev.map(f => {
          if (f.id === file.id) {
            if (f.progress >= 100) {
              clearInterval(interval);
              return { ...f, status: 'completed', progress: 100 };
            }
            return { ...f, progress: f.progress + 10 };
          }
          return f;
        }));
      }, 200);
    });
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Data Upload
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload device data files for analysis and prediction
        </p>
      </div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card"
      >
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-gray-300 dark:border-gray-600'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Upload Device Data
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Drag and drop your files here, or click to browse
          </p>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Choose Files
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Supports CSV, JSON, XML files up to 100MB
          </p>
        </div>
      </motion.div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Uploaded Files
          </h2>
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {file.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {file.progress}%
                      </span>
                    </div>
                  )}
                  
                  {file.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Upload Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upload Options
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="autoProcess" className="rounded" />
              <label htmlFor="autoProcess" className="text-gray-700 dark:text-gray-300">
                Auto-process uploaded files
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="validateData" className="rounded" defaultChecked />
              <label htmlFor="validateData" className="text-gray-700 dark:text-gray-300">
                Validate data before processing
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="backupData" className="rounded" />
              <label htmlFor="backupData" className="text-gray-700 dark:text-gray-300">
                Create backup of original files
              </label>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Data Sources
          </h2>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Database className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700 dark:text-gray-300">Connect Database</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Cloud className="w-5 h-5 text-green-600" />
              <span className="text-gray-700 dark:text-gray-300">Cloud Storage</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Download className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700 dark:text-gray-300">API Integration</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Upload History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="card"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Uploads
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">device_data_jan_2024.csv</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Uploaded 2 hours ago</p>
              </div>
            </div>
            <span className="text-sm text-green-600">Processed</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">sensor_logs.json</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Uploaded 1 day ago</p>
              </div>
            </div>
            <span className="text-sm text-yellow-600">Validation Failed</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DataUpload;

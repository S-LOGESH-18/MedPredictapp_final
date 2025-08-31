import React, { useState, useRef } from 'react';
import { sendAlert } from './api';
import './AlertForm.css';

const AlertForm = ({ onSubmit }) => {
  const [file, setFile] = useState(null);
  const [severity, setSeverity] = useState('medium');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a PDF file');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('severity', severity);

      // Call the API
      const result = await sendAlert(formData);
      
      // Call the parent's onSubmit handler with success
      onSubmit({ 
        type: 'success', 
        message: 'Alert sent successfully!',
        data: result.data
      });
      
      // Reset form
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      // Call the parent's onSubmit handler with error
      onSubmit({ 
        type: 'error', 
        message: error.message || 'Failed to send alert. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form className="alert-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="file-upload" className="file-upload-label">
          {file ? file.name : 'Choose PDF file...'}
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="file-input"
          />
        </label>
      </div>

      <div className="form-group">
        <h3>Select Severity Level:</h3>
        <div className="severity-buttons">
          <button
            type="button"
            className={`severity-btn low ${severity === 'low' ? 'active' : ''}`}
            onClick={() => setSeverity('low')}
          >
            Low
          </button>
          <button
            type="button"
            className={`severity-btn medium ${severity === 'medium' ? 'active' : ''}`}
            onClick={() => setSeverity('medium')}
          >
            Medium
          </button>
          <button
            type="button"
            className={`severity-btn high ${severity === 'high' ? 'active' : ''}`}
            onClick={() => setSeverity('high')}
          >
            High
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="submit-btn"
        disabled={!file || isUploading}
      >
        {isUploading ? 'Sending Alert...' : 'Send Alert'}
      </button>
    </form>
  );
};

export default AlertForm;

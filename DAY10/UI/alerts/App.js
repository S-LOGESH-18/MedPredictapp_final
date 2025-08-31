import React, { useState } from 'react';
import AlertForm from './AlertForm';

function NOVUApp() {
  const [alert, setAlert] = useState(null);

  const handleSubmit = async (response) => {
    setAlert({
      type: response.type,
      message: response.message,
      data: response.data
    });
    
    // Auto-hide the alert after 5 seconds
    if (response.type === 'success') {
      setTimeout(() => {
        setAlert(null);
      }, 5000);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>MediAlert</h1>
        <p>Medical Alert System</p>
      </header>
      
      <main className="app-main">
        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}
        
        <div className="form-container">
          <AlertForm onSubmit={handleSubmit} />
        </div>
      </main>
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} MediAlert - All rights reserved</p>
      </footer>
    </div>
  );
}

export default NOVUApp;

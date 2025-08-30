import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import LandingPage from './components/LandingPage';
import AboutPage from './components/AboutPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <AnimatePresence mode="wait">
            <Routes>
              <Route 
                path="/" 
                element={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <LandingPage />
                  </motion.div>
                } 
              />
              <Route 
                path="/about" 
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <AboutPage />
                  </motion.div>
                } 
              />
              <Route 
                path="/auth" 
                element={
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <AuthPage onLogin={handleLogin} />
                  </motion.div>
                } 
              />
              <Route 
                path="/dashboard/*" 
                element={
                  isAuthenticated ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Dashboard onLogout={handleLogout} />
                    </motion.div>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                } 
              />
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

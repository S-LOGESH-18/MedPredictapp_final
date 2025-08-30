import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

// Components
import Sidebar from './dashboard/Sidebar';
import TopNavbar from './dashboard/TopNavbar';
import DashboardOverview from './dashboard/DashboardOverview';
import DeviceAnalysis from './dashboard/DeviceAnalysis';
import FailureAlerts from './dashboard/FailureAlerts';
import Reports from './dashboard/Reports';
import Manufacturers from './dashboard/Manufacturers';
import DataUpload from './dashboard/DataUpload';
import Settings from './dashboard/Settings';

const Dashboard = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDarkMode } = useTheme();
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        currentPath={location.pathname}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar 
          onToggleSidebar={toggleSidebar}
          onLogout={onLogout}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <motion.div
                      key="dashboard"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DashboardOverview />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/analysis" 
                  element={
                    <motion.div
                      key="analysis"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DeviceAnalysis />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/alerts" 
                  element={
                    <motion.div
                      key="alerts"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FailureAlerts />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/reports" 
                  element={
                    <motion.div
                      key="reports"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Reports />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/manufacturers" 
                  element={
                    <motion.div
                      key="manufacturers"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Manufacturers />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/upload" 
                  element={
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DataUpload />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Settings />
                    </motion.div>
                  } 
                />
              </Routes>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

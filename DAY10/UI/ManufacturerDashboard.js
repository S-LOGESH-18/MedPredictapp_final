import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

// Components
import ManufacturerSidebar from './manufacturer/ManufacturerSidebar';
import ManufacturerTopNavbar from './manufacturer/ManufacturerTopNavbar';
import ManufacturerOverview from './manufacturer/ManufacturerOverview';
import DeviceManagement from './manufacturer/DeviceManagement';
import QualityControl from './manufacturer/QualityControl';
import ProductionReports from './manufacturer/ProductionReports';
import Inventory from './manufacturer/Inventory';
import Compliance from './manufacturer/Compliance';
import ManufacturerSettings from './manufacturer/ManufacturerSettings';

const ManufacturerDashboard = ({ onLogout, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDarkMode } = useTheme();
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <ManufacturerSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        currentPath={location.pathname}
        user={user}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <ManufacturerTopNavbar 
          onToggleSidebar={toggleSidebar}
          onLogout={onLogout}
          user={user}
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
                      key="manufacturer-dashboard"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ManufacturerOverview user={user} />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/devices" 
                  element={
                    <motion.div
                      key="devices"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DeviceManagement user={user} />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/quality" 
                  element={
                    <motion.div
                      key="quality"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <QualityControl user={user} />
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
                      <ProductionReports user={user} />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/inventory" 
                  element={
                    <motion.div
                      key="inventory"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Inventory user={user} />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/compliance" 
                  element={
                    <motion.div
                      key="compliance"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Compliance user={user} />
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
                      <ManufacturerSettings user={user} />
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

export default ManufacturerDashboard;

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import ManufacturerAuthPage from "./components/ManufacturerAuthPage";
import ManufacturerDashboard from "./components/ManufacturerDashboard";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/manufacturer-auth" replace />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return user ? <Navigate to="/manufacturer-dashboard" replace /> : children;
};

// App Routes Component
const AppRoutes = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out!");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out. Please try again.");
    }
  };

  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/manufacturer-auth"
            element={
              <PublicRoute>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <ManufacturerAuthPage />
                </motion.div>
              </PublicRoute>
            }
          />
          <Route
            path="/manufacturer-dashboard/*"
            element={
              <ProtectedRoute>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ManufacturerDashboard onLogout={handleLogout} user={user} />
                </motion.div>
              </ProtectedRoute>
            }
          />
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/manufacturer-auth" replace />} />
        </Routes>
      </AnimatePresence>

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={4000} />
    </Router>
  );
};

function ManuApp() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default ManuApp;

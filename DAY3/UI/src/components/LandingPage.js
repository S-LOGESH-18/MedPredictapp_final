import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Shield, 
  TrendingUp, 
  ArrowRight,
  Heart
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleLearnMore = () => {
    navigate('/about');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">MedPredict</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLearnMore}
            className="text-gray-600 hover:text-primary-600 transition-colors"
          >
            About
          </button>
          <button
            onClick={handleGetStarted}
            className="btn-primary"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Medical Device
              <span className="text-primary-600 block">Failure Prediction</span>
              <span className="text-3xl md:text-4xl font-normal text-gray-600 block mt-2">
                System
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              An AI-powered platform to proactively predict device failures, 
              ensuring patient safety and reducing downtime.
            </p>

            <motion.button
              onClick={handleGetStarted}
              className="btn-primary text-lg px-8 py-4 flex items-center mx-auto space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="py-16 px-6 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Real-time Monitoring
              </h3>
              <p className="text-gray-600">
                Continuous monitoring of device performance and health metrics
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Patient Safety
              </h3>
              <p className="text-gray-600">
                Proactive alerts prevent device failures before they occur
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Predictive Analytics
              </h3>
              <p className="text-gray-600">
                Advanced AI algorithms predict potential failures with high accuracy
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

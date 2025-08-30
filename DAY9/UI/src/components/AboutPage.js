import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Brain,
  Bell,
  Activity,
  BarChart3,
  Shield,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI/ML-driven Prediction",
      description: "Advanced machine learning algorithms analyze device data patterns to predict potential failures before they occur.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Bell,
      title: "Alerts & Notifications",
      description: "Real-time alerts and notifications keep healthcare staff informed about potential device issues.",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: Activity,
      title: "Device Performance Monitoring",
      description: "Continuous monitoring of device performance metrics and health indicators.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: BarChart3,
      title: "Risk Classification & Reporting",
      description: "Comprehensive risk assessment and detailed reporting for informed decision-making.",
      color: "bg-purple-100 text-purple-600"
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Enhanced Patient Safety",
      description: "Prevent device failures that could compromise patient care and safety."
    },
    {
      icon: Clock,
      title: "Reduced Downtime",
      description: "Minimize equipment downtime through proactive maintenance scheduling."
    },
    {
      icon: Users,
      title: "Improved Staff Efficiency",
      description: "Enable healthcare staff to focus on patient care rather than equipment issues."
    },
    {
      icon: TrendingUp,
      title: "Cost Optimization",
      description: "Reduce maintenance costs and extend device lifespan through predictive maintenance."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="btn-primary"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About Medical Device Failure Prediction
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Our AI-powered platform revolutionizes healthcare by predicting medical device failures 
              before they occur, ensuring uninterrupted patient care and optimal device performance.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Importance Section */}
      <div className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="card mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Why Predict Medical Device Failures?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Patient Safety First
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Medical device failures can have serious consequences for patient health and safety. 
                  By predicting potential failures, we can prevent critical incidents and ensure 
                  continuous, reliable patient care.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Operational Excellence
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Unplanned device downtime disrupts healthcare operations and increases costs. 
                  Predictive maintenance helps healthcare facilities maintain optimal operational 
                  efficiency and reduce unexpected expenses.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Key Features
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive tools and capabilities for effective device failure prediction
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Benefits
            </h2>
            <p className="text-xl text-gray-600">
              How our platform transforms healthcare operations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-6 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Healthcare Operations?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join healthcare facilities worldwide in implementing predictive maintenance for medical devices.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Get Started Today
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

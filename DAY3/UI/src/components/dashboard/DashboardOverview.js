import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Shield,
  Zap,
  Upload
} from 'lucide-react';

const DashboardOverview = () => {
  const stats = [
    {
      title: 'Total Devices',
      value: '1,247',
      change: '+12%',
      changeType: 'positive',
      icon: Activity,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Alerts',
      value: '23',
      change: '-5%',
      changeType: 'negative',
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      title: 'Healthy Devices',
      value: '1,189',
      change: '+8%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Predicted Failures',
      value: '15',
      change: '+3',
      changeType: 'neutral',
      icon: Clock,
      color: 'bg-yellow-500'
    }
  ];

  const recentAlerts = [
    {
      id: 1,
      device: 'Ventilator V-001',
      type: 'High Risk',
      message: 'Temperature sensor showing abnormal readings',
      time: '2 hours ago',
      status: 'critical'
    },
    {
      id: 2,
      device: 'ECG Monitor E-045',
      type: 'Medium Risk',
      message: 'Battery life below 20%',
      time: '4 hours ago',
      status: 'warning'
    },
    {
      id: 3,
      device: 'Infusion Pump I-123',
      type: 'Low Risk',
      message: 'Maintenance due in 7 days',
      time: '6 hours ago',
      status: 'info'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'info':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your medical devices and failure predictions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'positive' ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : stat.changeType === 'negative' ? (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'negative' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Alerts
              </h2>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {recentAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.status === 'critical' ? 'bg-red-500' :
                      alert.status === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {alert.device}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                      {alert.type}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {alert.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h2>
            
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
                <Upload className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Upload Device Data
                </span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 text-left bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Run Health Check
                </span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Generate Report
                </span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 text-left bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                <Activity className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  View Analytics
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  Filter,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  AlertTriangle,
  Bell,
  CheckCircle
} from 'lucide-react';
import novuService from '../../services/novuService';

const DeviceAnalysis = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [alertStatus, setAlertStatus] = useState({});
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  const devices = [
    {
      id: 'V-001',
      name: 'Ventilator V-001',
      type: 'Ventilator',
      status: 'healthy',
      lastCheck: '2 hours ago',
      riskLevel: 'Low',
      performance: 95,
      trend: 'up'
    },
    {
      id: 'E-045',
      name: 'ECG Monitor E-045',
      type: 'ECG Monitor',
      status: 'warning',
      lastCheck: '1 hour ago',
      riskLevel: 'Medium',
      performance: 78,
      trend: 'down'
    },
    {
      id: 'I-123',
      name: 'Infusion Pump I-123',
      type: 'Infusion Pump',
      status: 'critical',
      lastCheck: '30 minutes ago',
      riskLevel: 'High',
      performance: 45,
      trend: 'down'
    },
    {
      id: 'D-789',
      name: 'Defibrillator D-789',
      type: 'Defibrillator',
      status: 'healthy',
      lastCheck: '4 hours ago',
      riskLevel: 'Low',
      performance: 98,
      trend: 'up'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low':
        return 'text-green-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'High':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || device.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Handle sending device risk alert
  const handleSendAlert = async (device) => {
    setIsSendingAlert(true);
    setAlertStatus(prev => ({ ...prev, [device.id]: 'sending' }));

    try {
      let result;
      
      if (device.riskLevel === 'High' || device.status === 'critical') {
        result = await novuService.sendCriticalDeviceAlert(device);
      } else {
        result = await novuService.sendDeviceRiskAlert(device);
      }

      setAlertStatus(prev => ({ 
        ...prev, 
        [device.id]: 'success',
        message: result.message || 'Alert sent successfully!'
      }));

      // Clear success status after 3 seconds
      setTimeout(() => {
        setAlertStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[device.id];
          delete newStatus.message;
          return newStatus;
        });
      }, 3000);

    } catch (error) {
      console.error('Error sending alert:', error);
      setAlertStatus(prev => ({ 
        ...prev, 
        [device.id]: 'error',
        message: 'Failed to send alert. Please try again.'
      }));

      // Clear error status after 5 seconds
      setTimeout(() => {
        setAlertStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[device.id];
          delete newStatus.message;
          return newStatus;
        });
      }, 5000);
    } finally {
      setIsSendingAlert(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Device Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze device performance and health metrics
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search devices by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Advanced</span>
          </button>
        </div>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map((device, index) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {device.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {device.type}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                device.status === 'healthy' ? 'bg-green-500' :
                device.status === 'warning' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                  {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Risk Level:</span>
                <span className={`text-sm font-medium ${getRiskColor(device.riskLevel)}`}>
                  {device.riskLevel}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Performance:</span>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {device.performance}%
                  </span>
                  {device.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Check:</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {device.lastCheck}
                </span>
              </div>
            </div>

                         <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
               <div className="flex space-x-2">
                 <button className="flex-1 px-3 py-2 text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
                   View Details
                 </button>
                 
                 {/* Alert Button */}
                 <button 
                   onClick={() => handleSendAlert(device)}
                   disabled={isSendingAlert || alertStatus[device.id] === 'sending'}
                   className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center space-x-1 ${
                     alertStatus[device.id] === 'success' 
                       ? 'bg-green-50 dark:bg-green-900/20 text-green-600' 
                       : alertStatus[device.id] === 'error'
                       ? 'bg-red-50 dark:bg-red-900/20 text-red-600'
                       : device.riskLevel === 'High' || device.status === 'critical'
                       ? 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30'
                       : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                   }`}
                   title={`Send ${device.riskLevel === 'High' || device.status === 'critical' ? 'Critical' : 'Risk'} Alert`}
                 >
                   {alertStatus[device.id] === 'sending' ? (
                     <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                   ) : alertStatus[device.id] === 'success' ? (
                     <CheckCircle className="w-4 h-4" />
                   ) : device.riskLevel === 'High' || device.status === 'critical' ? (
                     <AlertTriangle className="w-4 h-4" />
                   ) : (
                     <Bell className="w-4 h-4" />
                   )}
                 </button>
                 
                 <button className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                   <BarChart3 className="w-4 h-4" />
                 </button>
               </div>
               
               {/* Alert Status Message */}
               {alertStatus[device.id] && alertStatus.message && (
                 <div className={`mt-2 text-xs px-2 py-1 rounded ${
                   alertStatus[device.id] === 'success' 
                     ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                     : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                 }`}>
                   {alertStatus.message}
                 </div>
               )}
             </div>
          </motion.div>
        ))}
      </div>

      {/* Analysis Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Trends
          </h2>
          <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Performance chart will be displayed here</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Risk Distribution
          </h2>
          <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-2" />
              <p>Risk distribution chart will be displayed here</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Export Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="card"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Export Analysis
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Download detailed analysis reports
            </p>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeviceAnalysis;

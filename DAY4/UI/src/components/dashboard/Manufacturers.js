import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Factory,
  Search,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  AlertTriangle,
  Bell,
  CheckCircle
} from 'lucide-react';
import novuService from '../../services/novuService';

const Manufacturers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [alertStatus, setAlertStatus] = useState({});
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  const manufacturers = [
    {
      id: 1,
      name: 'MedTech Solutions',
      devices: 245,
      status: 'active',
      performance: 95,
      alerts: 3,
      lastUpdate: '2 days ago'
    },
    {
      id: 2,
      name: 'HealthCare Systems',
      devices: 189,
      status: 'active',
      performance: 88,
      alerts: 7,
      lastUpdate: '1 day ago'
    },
    {
      id: 3,
      name: 'BioMedical Corp',
      devices: 156,
      status: 'warning',
      performance: 72,
      alerts: 12,
      lastUpdate: '3 days ago'
    },
    {
      id: 4,
      name: 'LifeSupport Technologies',
      devices: 98,
      status: 'critical',
      performance: 45,
      alerts: 25,
      lastUpdate: '5 days ago'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredManufacturers = manufacturers.filter(manufacturer =>
    manufacturer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle sending manufacturer alert
  const handleSendAlert = async (manufacturer) => {
    setIsSendingAlert(true);
    setAlertStatus(prev => ({ ...prev, [manufacturer.id]: 'sending' }));

    try {
      const result = await novuService.sendManufacturerAlert(manufacturer);

      setAlertStatus(prev => ({ 
        ...prev, 
        [manufacturer.id]: 'success',
        message: result.message || 'Manufacturer alert sent successfully!'
      }));

      // Clear success status after 3 seconds
      setTimeout(() => {
        setAlertStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[manufacturer.id];
          delete newStatus.message;
          return newStatus;
        });
      }, 3000);

    } catch (error) {
      console.error('Error sending manufacturer alert:', error);
      setAlertStatus(prev => ({ 
        ...prev, 
        [manufacturer.id]: 'error',
        message: 'Failed to send alert. Please try again.'
      }));

      // Clear error status after 5 seconds
      setTimeout(() => {
        setAlertStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[manufacturer.id];
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manufacturers
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage device manufacturers and their performance
          </p>
        </div>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Manufacturer</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search manufacturers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Manufacturers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredManufacturers.map((manufacturer, index) => (
          <motion.div
            key={manufacturer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Factory className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {manufacturer.name}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(manufacturer.status)}`}>
                    {manufacturer.status.charAt(0).toUpperCase() + manufacturer.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Devices:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {manufacturer.devices}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Performance:</span>
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {manufacturer.performance}%
                  </span>
                  {manufacturer.performance >= 80 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : manufacturer.performance >= 60 ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Alerts:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {manufacturer.alerts}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Update:</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {manufacturer.lastUpdate}
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
                   onClick={() => handleSendAlert(manufacturer)}
                   disabled={isSendingAlert || alertStatus[manufacturer.id] === 'sending'}
                   className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center space-x-1 ${
                     alertStatus[manufacturer.id] === 'success' 
                       ? 'bg-green-50 dark:bg-green-900/20 text-green-600' 
                       : alertStatus[manufacturer.id] === 'error'
                       ? 'bg-red-50 dark:bg-red-900/20 text-red-600'
                       : manufacturer.status === 'critical'
                       ? 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30'
                       : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                   }`}
                   title={`Send ${manufacturer.status === 'critical' ? 'Critical' : 'Performance'} Alert`}
                 >
                   {alertStatus[manufacturer.id] === 'sending' ? (
                     <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                   ) : alertStatus[manufacturer.id] === 'success' ? (
                     <CheckCircle className="w-4 h-4" />
                   ) : manufacturer.status === 'critical' ? (
                     <AlertTriangle className="w-4 h-4" />
                   ) : (
                     <Bell className="w-4 h-4" />
                   )}
                 </button>
                 
                 <button className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                   <Edit className="w-4 h-4" />
                 </button>
                 <button className="px-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
               
               {/* Alert Status Message */}
               {alertStatus[manufacturer.id] && alertStatus.message && (
                 <div className={`mt-2 text-xs px-2 py-1 rounded ${
                   alertStatus[manufacturer.id] === 'success' 
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card text-center"
        >
          <div className="text-2xl font-bold text-blue-600">12</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Manufacturers</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="card text-center"
        >
          <div className="text-2xl font-bold text-green-600">8</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="card text-center"
        >
          <div className="text-2xl font-bold text-yellow-600">3</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Warning</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="card text-center"
        >
          <div className="text-2xl font-bold text-red-600">1</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Critical</div>
        </motion.div>
      </div>
    </div>
  );
};

export default Manufacturers;

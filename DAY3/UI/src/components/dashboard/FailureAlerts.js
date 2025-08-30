import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Bell,
  Eye,
  X,
  RefreshCw
} from 'lucide-react';

const FailureAlerts = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const alerts = [
    {
      id: 1,
      device: 'Ventilator V-001',
      type: 'Critical',
      message: 'Temperature sensor showing abnormal readings',
      time: '2 hours ago',
      status: 'unread',
      priority: 'high'
    },
    {
      id: 2,
      device: 'ECG Monitor E-045',
      type: 'Warning',
      message: 'Battery life below 20%',
      time: '4 hours ago',
      status: 'read',
      priority: 'medium'
    },
    {
      id: 3,
      device: 'Infusion Pump I-123',
      type: 'Info',
      message: 'Maintenance due in 7 days',
      time: '6 hours ago',
      status: 'read',
      priority: 'low'
    },
    {
      id: 4,
      device: 'Defibrillator D-789',
      type: 'Critical',
      message: 'Power supply voltage fluctuations detected',
      time: '1 hour ago',
      status: 'unread',
      priority: 'high'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'Warning':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'Info':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || alert.type.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Failure Alerts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage device failure alerts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search alerts..."
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
            <option value="all">All Types</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>More</span>
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`card border-l-4 ${
              alert.status === 'unread' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  {getTypeIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {alert.device}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(alert.priority)}`}>
                      {alert.type}
                    </span>
                    {alert.status === 'unread' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {alert.message}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{alert.time}</span>
                    <span>Priority: {alert.priority}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No alerts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || selectedFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'All clear! No failure alerts at the moment.'
            }
          </p>
        </motion.div>
      )}

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="card text-center"
        >
          <div className="text-2xl font-bold text-red-600">5</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Critical Alerts</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="card text-center"
        >
          <div className="text-2xl font-bold text-yellow-600">12</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Warnings</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="card text-center"
        >
          <div className="text-2xl font-bold text-blue-600">8</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Info Alerts</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="card text-center"
        >
          <div className="text-2xl font-bold text-green-600">25</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Resolved</div>
        </motion.div>
      </div>
    </div>
  );
};

export default FailureAlerts;

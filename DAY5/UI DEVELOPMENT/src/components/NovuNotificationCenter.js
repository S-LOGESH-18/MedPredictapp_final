import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, X, Check, Archive, Trash2, AlertTriangle, Activity } from 'lucide-react';

const NovuNotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'critical',
      title: 'Critical Device Alert',
      message: 'Infusion Pump I-123 is at high risk of failure. Immediate attention required.',
      deviceId: 'I-123',
      deviceName: 'Infusion Pump I-123',
      timestamp: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Device Performance Warning',
      message: 'ECG Monitor E-045 showing performance degradation. Schedule maintenance.',
      deviceId: 'E-045',
      deviceName: 'ECG Monitor E-045',
      timestamp: '15 minutes ago',
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Manufacturer Performance Alert',
      message: 'BioMedical Corp devices showing below-average performance.',
      manufacturer: 'BioMedical Corp',
      timestamp: '1 hour ago',
      read: true
    },
    {
      id: 4,
      type: 'success',
      title: 'Maintenance Completed',
      message: 'Ventilator V-001 maintenance completed successfully.',
      deviceId: 'V-001',
      deviceName: 'Ventilator V-001',
      timestamp: '2 hours ago',
      read: true
    }
  ]);

  const [filter, setFilter] = useState('all');

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <Activity className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'critical':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filter === 'all' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filter === 'unread' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Unread
              </button>
            </div>
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Mark all read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-2 p-3 rounded-lg border-l-4 transition-colors cursor-pointer ${
                    getNotificationColor(notification.type)
                  } ${!notification.read ? 'ring-2 ring-primary-200 dark:ring-primary-800' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      {notification.deviceName && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Device: {notification.deviceName}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{filteredNotifications.length} notifications</span>
            <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
              View all
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NovuNotificationCenter;

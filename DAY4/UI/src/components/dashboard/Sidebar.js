import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3,
  Search,
  AlertTriangle,
  FileText,
  Factory,
  Upload,
  Settings,
  X,
  Heart
} from 'lucide-react';

const Sidebar = ({ isOpen, onToggle, currentPath }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      icon: BarChart3,
      label: 'Dashboard',
      path: '/dashboard',
      description: 'Overview of predictions'
    },
    {
      icon: Search,
      label: 'Device Analysis',
      path: '/dashboard/analysis',
      description: 'Analyze device data'
    },
    {
      icon: AlertTriangle,
      label: 'Failure Alerts',
      path: '/dashboard/alerts',
      description: 'View failure alerts'
    },
    {
      icon: FileText,
      label: 'Reports',
      path: '/dashboard/reports',
      description: 'Generate reports'
    },
    {
      icon: Factory,
      label: 'Manufacturers',
      path: '/dashboard/manufacturers',
      description: 'Manage manufacturers'
    },
    {
      icon: Upload,
      label: 'Data Upload',
      path: '/dashboard/upload',
      description: 'Upload device data'
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/dashboard/settings',
      description: 'Configure settings'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isOpen ? '280px' : '0px',
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="fixed lg:relative z-50 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800 dark:text-white">MedPredict</span>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full sidebar-item ${
                    isActive(item.path) ? 'active' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              © 2025 MedPredict
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;

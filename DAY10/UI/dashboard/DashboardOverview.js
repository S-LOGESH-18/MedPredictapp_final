import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, animate } from 'framer-motion';
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

const DotsLoader = () => {
  return (
    <div className="flex space-x-1">
      <span className="loader-dot bg-gray-500"></span>
      <span className="loader-dot bg-gray-500"></span>
      <span className="loader-dot bg-gray-500"></span>
      <span className="loader-dot bg-gray-500"></span>
    </div>
  );
};

// 🔹 Animated Number Component
const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: v => setDisplayValue(Math.floor(v))
    });
    return () => controls.stop();
  }, [value]);

  return <span>{displayValue}</span>;
};

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ totalDevices: 0, risk: 0, critical: 0, warning: 0, source: 'unknown' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:5000';
    const controller = new AbortController();
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/overview-metrics`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMetrics({
          totalDevices: data.totalDevices ?? 0,
          risk: data.risk ?? 0,
          critical: data.critical ?? 0,
          warning: data.warning ?? 0,
          source: data.source || 'unknown'
        });
        setError('');
      } catch (e) {
        setError('Failed to load overview metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
    return () => controller.abort();
  }, []);

  const safeCount = useMemo(() => {
    const total = Number(metrics.totalDevices || 0);
    const risk = Number(metrics.risk || 0);
    const warning = Number(metrics.warning || 0);
    const safe = total - (risk + warning);
    return safe > 0 ? safe : 0;
  }, [metrics]);

  const stats = [
    {
      title: 'Total Devices',
      value: metrics.totalDevices,
      icon: Activity,
      color: 'bg-blue-500'
    },
    {
      title: 'Risk',
      value: metrics.risk,
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      title: 'Warning',
      value: metrics.warning,
      icon: CheckCircle,
      color: 'bg-yellow-500'
    },
    {
      title: 'Safe',
      value: safeCount,
      icon: Clock,
      color: 'bg-green-500'
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
          Monitor your medical devices 
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
                  {loading ? <DotsLoader /> : <AnimatedNumber value={stat.value} />}
                </p>
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
              <button onClick={() => navigate('/dashboard/alerts')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
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
              <button onClick={() => navigate('/dashboard/settings')} className="w-full flex items-center space-x-3 p-3 text-left bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
                <Upload className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Settings
                </span>
              </button>
              
              <button onClick={() => navigate('/dashboard/alerts')} className="w-full flex items-center space-x-3 p-3 text-left bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Run Health Check
                </span>
              </button>
              
              <button onClick={() => navigate('/dashboard/reports')} className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Generate Report
                </span>
              </button>
              
              <button onClick={() => navigate('/dashboard/analysis')} className="w-full flex items-center space-x-3 p-3 text-left bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
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

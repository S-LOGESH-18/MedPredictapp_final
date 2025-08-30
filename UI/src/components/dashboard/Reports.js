import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText,
  Download,
  Filter,
  BarChart3,
  TrendingUp,
  Clock,
  Eye
} from 'lucide-react';

const Reports = () => {

  const reports = [
    {
      id: 1,
      title: 'Monthly Device Health Report',
      type: 'Health Analysis',
      date: '2024-01-15',
      status: 'Generated',
      size: '2.4 MB'
    },
    {
      id: 2,
      title: 'Failure Prediction Analysis',
      type: 'Predictive',
      date: '2024-01-14',
      status: 'Generated',
      size: '1.8 MB'
    },
    {
      id: 3,
      title: 'Critical Device Alerts Summary',
      type: 'Alert Summary',
      date: '2024-01-13',
      status: 'Generated',
      size: '0.9 MB'
    },
    {
      id: 4,
      title: 'Manufacturer Performance Report',
      type: 'Performance',
      date: '2024-01-12',
      status: 'Pending',
      size: '3.2 MB'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate and manage device failure prediction reports
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Generate Health Report
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create comprehensive device health analysis
              </p>
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Predictive Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate failure prediction insights
              </p>
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Scheduled Reports
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set up automated report generation
              </p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Reports List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Reports
          </h2>
          <div className="flex items-center space-x-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="all">All Types</option>
              <option value="health">Health Analysis</option>
              <option value="predictive">Predictive</option>
              <option value="alerts">Alert Summary</option>
            </select>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {report.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{report.type}</span>
                    <span>•</span>
                    <span>{report.date}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  report.status === 'Generated' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.status}
                </span>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Report Templates
          </h2>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Executive Summary</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">High-level overview for management</div>
            </button>
            <button className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Technical Analysis</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Detailed technical insights</div>
            </button>
            <button className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Compliance Report</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Regulatory compliance summary</div>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Report Statistics
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Reports Generated</span>
              <span className="font-semibold text-gray-900 dark:text-white">156</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">This Month</span>
              <span className="font-semibold text-gray-900 dark:text-white">23</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Size</span>
              <span className="font-semibold text-gray-900 dark:text-white">2.4 GB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Scheduled Reports</span>
              <span className="font-semibold text-gray-900 dark:text-white">8</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  TrendingUp,
  Filter,
  Search,
  Eye,
  Edit,
  Plus
} from 'lucide-react';

const QualityControl = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data - replace with actual data from your backend
  const qualityChecks = [
    {
      id: 'QC001',
      deviceName: 'MRI Scanner Model X-2000',
      serialNumber: 'MRI-X2000-001',
      testType: 'Safety Test',
      status: 'passed',
      score: 98.5,
      inspector: 'Dr. Sarah Johnson',
      date: '2024-01-15',
      notes: 'All safety parameters within acceptable range'
    },
    {
      id: 'QC002',
      deviceName: 'CT Scanner Model Y-1500',
      serialNumber: 'CT-Y1500-002',
      testType: 'Performance Test',
      status: 'failed',
      score: 72.3,
      inspector: 'Dr. Michael Chen',
      date: '2024-01-14',
      notes: 'Image resolution below standard. Requires recalibration.'
    },
    {
      id: 'QC003',
      deviceName: 'Ultrasound Device Model Z-100',
      serialNumber: 'US-Z100-003',
      testType: 'Calibration Test',
      status: 'passed',
      score: 99.1,
      inspector: 'Dr. Emily Rodriguez',
      date: '2024-01-13',
      notes: 'Excellent calibration results. Ready for production.'
    },
    {
      id: 'QC004',
      deviceName: 'X-Ray Machine Model A-500',
      serialNumber: 'XR-A500-004',
      testType: 'Radiation Test',
      status: 'pending',
      score: null,
      inspector: 'Dr. David Kim',
      date: '2024-01-12',
      notes: 'Test scheduled for tomorrow morning.'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'pending': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredChecks = qualityChecks.filter(check => {
    const matchesSearch = check.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         check.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || check.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const qualityMetrics = {
    totalTests: qualityChecks.length,
    passedTests: qualityChecks.filter(c => c.status === 'passed').length,
    failedTests: qualityChecks.filter(c => c.status === 'failed').length,
    pendingTests: qualityChecks.filter(c => c.status === 'pending').length,
    averageScore: qualityChecks.filter(c => c.score).reduce((acc, c) => acc + c.score, 0) / qualityChecks.filter(c => c.score).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quality Control
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage quality assurance processes
          </p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>New Quality Check</span>
        </button>
      </div>

      {/* Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{qualityMetrics.totalTests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Passed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{qualityMetrics.passedTests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{qualityMetrics.failedTests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {qualityMetrics.averageScore.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by device name or serial number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            >
              <option value="all">All Status</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quality Checks Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Test Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Inspector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredChecks.map((check, index) => (
                <motion.tr
                  key={check.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {check.deviceName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {check.serialNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {check.testType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                      {getStatusIcon(check.status)}
                      <span className="ml-1 capitalize">{check.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {check.score ? (
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              check.score >= 90 ? 'bg-green-500' :
                              check.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${check.score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {check.score}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {check.inspector}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(check.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QualityControl;

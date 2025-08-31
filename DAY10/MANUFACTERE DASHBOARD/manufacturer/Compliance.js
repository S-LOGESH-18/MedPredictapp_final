import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  FileText,
  Calendar,
  TrendingUp,
  Download
} from 'lucide-react';

const Compliance = ({ user }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data - replace with actual data from your backend
  const complianceItems = [
    {
      id: 'COMP001',
      regulation: 'FDA 21 CFR Part 820',
      title: 'Quality System Regulation',
      status: 'compliant',
      lastReview: '2024-01-15',
      nextReview: '2024-07-15',
      responsible: 'Dr. Sarah Johnson',
      description: 'Quality management system compliance for medical devices'
    },
    {
      id: 'COMP002',
      regulation: 'ISO 13485:2016',
      title: 'Medical Devices Quality Management',
      status: 'compliant',
      lastReview: '2024-01-10',
      nextReview: '2024-07-10',
      responsible: 'Dr. Michael Chen',
      description: 'International standard for medical device quality management'
    },
    {
      id: 'COMP003',
      regulation: 'IEC 60601-1',
      title: 'Medical Electrical Equipment Safety',
      status: 'pending',
      lastReview: '2023-12-20',
      nextReview: '2024-06-20',
      responsible: 'Dr. Emily Rodriguez',
      description: 'Safety requirements for medical electrical equipment'
    },
    {
      id: 'COMP004',
      regulation: 'EU MDR 2017/745',
      title: 'European Medical Device Regulation',
      status: 'non-compliant',
      lastReview: '2023-11-15',
      nextReview: '2024-05-15',
      responsible: 'Dr. David Kim',
      description: 'European Union medical device regulations compliance'
    },
    {
      id: 'COMP005',
      regulation: 'Health Canada MDR',
      title: 'Canadian Medical Device Regulations',
      status: 'compliant',
      lastReview: '2024-01-05',
      nextReview: '2024-07-05',
      responsible: 'Dr. Lisa Wang',
      description: 'Health Canada medical device regulations'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'non-compliant': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertTriangle className="w-4 h-4" />;
      case 'non-compliant': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredItems = complianceItems.filter(item => {
    return selectedFilter === 'all' || item.status === selectedFilter;
  });

  const complianceMetrics = {
    totalRegulations: complianceItems.length,
    compliant: complianceItems.filter(item => item.status === 'compliant').length,
    pending: complianceItems.filter(item => item.status === 'pending').length,
    nonCompliant: complianceItems.filter(item => item.status === 'non-compliant').length,
    complianceRate: (complianceItems.filter(item => item.status === 'compliant').length / complianceItems.length) * 100
  };

  const upcomingReviews = complianceItems
    .filter(item => new Date(item.nextReview) > new Date())
    .sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Regulatory Compliance
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage regulatory compliance requirements
          </p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Export Compliance Report</span>
        </button>
      </div>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Regulations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{complianceMetrics.totalRegulations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliant</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{complianceMetrics.compliant}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{complianceMetrics.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {complianceMetrics.complianceRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Compliance Status
              </h3>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              >
                <option value="all">All Status</option>
                <option value="compliant">Compliant</option>
                <option value="pending">Pending</option>
                <option value="non-compliant">Non-Compliant</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Regulation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Next Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Responsible
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.regulation}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1 capitalize">{item.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(item.nextReview).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.ceil((new Date(item.nextReview) - new Date()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.responsible}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                          View
                        </button>
                        <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors">
                          Update
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Reviews */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Reviews
          </h3>
          <div className="space-y-4">
            {upcomingReviews.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {item.regulation}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    Due: {new Date(item.nextReview).toLocaleDateString()}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {Math.ceil((new Date(item.nextReview) - new Date()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Compliance Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Regulatory Bodies</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-400">FDA (USA)</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Compliant</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-400">Health Canada</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Compliant</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-400">EU MDR</span>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Non-Compliant</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Certification Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-400">ISO 13485</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Certified</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-400">CE Marking</span>
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-400">FDA Approval</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compliance;

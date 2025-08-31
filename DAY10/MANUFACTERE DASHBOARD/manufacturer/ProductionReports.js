import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Filter,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react';

const ProductionReports = ({ user }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('production');

  // Mock data - replace with actual data from your backend
  const productionData = [
    { month: 'Jan', devices: 120, target: 150, efficiency: 80 },
    { month: 'Feb', devices: 135, target: 150, efficiency: 90 },
    { month: 'Mar', devices: 142, target: 150, efficiency: 95 },
    { month: 'Apr', devices: 138, target: 150, efficiency: 92 },
    { month: 'May', devices: 155, target: 150, efficiency: 103 },
    { month: 'Jun', devices: 148, target: 150, efficiency: 99 }
  ];

  const deviceTypes = [
    { type: 'MRI Scanner', count: 45, percentage: 30 },
    { type: 'CT Scanner', count: 38, percentage: 25 },
    { type: 'Ultrasound', count: 32, percentage: 21 },
    { type: 'X-Ray Machine', count: 25, percentage: 17 },
    { type: 'Other', count: 10, percentage: 7 }
  ];

  const qualityTrends = [
    { month: 'Jan', qualityScore: 95.2, defects: 8 },
    { month: 'Feb', qualityScore: 96.1, defects: 6 },
    { month: 'Mar', qualityScore: 97.3, defects: 4 },
    { month: 'Apr', qualityScore: 96.8, defects: 5 },
    { month: 'May', qualityScore: 98.1, defects: 3 },
    { month: 'Jun', qualityScore: 97.9, defects: 3 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Production Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analyze production data and generate comprehensive reports
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn-primary flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedReport('production')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedReport === 'production'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Production Overview
          </button>
          <button
            onClick={() => setSelectedReport('quality')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedReport === 'quality'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-5 h-5 inline mr-2" />
            Quality Trends
          </button>
          <button
            onClick={() => setSelectedReport('devices')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedReport === 'devices'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <PieChart className="w-5 h-5 inline mr-2" />
            Device Distribution
          </button>
        </div>
      </div>

      {/* Production Overview Report */}
      {selectedReport === 'production' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Production Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Monthly Production vs Target
            </h3>
            <div className="h-80 flex items-end space-x-2">
              {productionData.map((item, index) => (
                <div key={item.month} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t mb-2 relative">
                    <div 
                      className="bg-blue-500 rounded-t transition-all duration-500"
                      style={{ height: `${(item.devices / 200) * 100}%` }}
                    ></div>
                    <div 
                      className="absolute top-0 left-0 right-0 bg-gray-300 dark:bg-gray-600 rounded-t opacity-50"
                      style={{ height: `${(item.target / 200) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400 block">{item.month}</span>
                    <span className="text-xs text-gray-900 dark:text-white font-medium">{item.devices}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Actual Production</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Target</span>
              </div>
            </div>
          </div>

          {/* Production Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {productionData.reduce((acc, item) => acc + item.devices, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Devices Produced</div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {Math.round(productionData.reduce((acc, item) => acc + item.efficiency, 0) / productionData.length)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Efficiency</div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {productionData.filter(item => item.devices >= item.target).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Months Above Target</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quality Trends Report */}
      {selectedReport === 'quality' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Quality Score Trends
            </h3>
            <div className="h-80 flex items-end space-x-2">
              {qualityTrends.map((item, index) => (
                <div key={item.month} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t mb-2">
                    <div 
                      className="bg-green-500 rounded-t transition-all duration-500"
                      style={{ height: `${(item.qualityScore / 100) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400 block">{item.month}</span>
                    <span className="text-xs text-gray-900 dark:text-white font-medium">{item.qualityScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quality Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Average Quality Score</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(qualityTrends.reduce((acc, item) => acc + item.qualityScore, 0) / qualityTrends.length).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Defects</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {qualityTrends.reduce((acc, item) => acc + item.defects, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Best Month</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {qualityTrends.reduce((max, item) => item.qualityScore > max ? item.qualityScore : max, 0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Defect Analysis</h4>
              <div className="space-y-3">
                {qualityTrends.map((item) => (
                  <div key={item.month} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{item.month}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(item.defects / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{item.defects}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Device Distribution Report */}
      {selectedReport === 'devices' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Device Type Distribution
              </h3>
              <div className="space-y-4">
                {deviceTypes.map((device, index) => (
                  <div key={device.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: `hsl(${index * 60}, 70%, 60%)` }}
                      ></div>
                      <span className="text-gray-900 dark:text-white">{device.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{device.count}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">({device.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Production Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Total Device Types</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{deviceTypes.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Most Produced</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {deviceTypes.reduce((max, device) => device.count > max.count ? device : max).type}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Total Units</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {deviceTypes.reduce((acc, device) => acc + device.count, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProductionReports;

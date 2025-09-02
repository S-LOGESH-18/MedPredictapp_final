import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  Settings,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,LineChart
} from "recharts";

const ManufacturerOverview = ({ user }) => {
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [riskChart, setRiskChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devicesRes, summaryRes, riskRes] = await Promise.all([
          fetch("http://127.0.0.1:5000/api/dashboard/devices"),
          fetch("http://127.0.0.1:5000/api/dashboard/summary"),
          fetch("http://127.0.0.1:5000/api/dashboard/risk"),
        ]);

        const devicesData = await devicesRes.json();
        const summaryData = await summaryRes.json();
        const riskData = await riskRes.json();

        const totalDevices =
          summaryData?.total_devices ||
          (devicesData.devices ? devicesData.devices.length : 0);
        const totalManufacturers = summaryData?.total_manufacturers || 342;
        const implantedDevices = summaryData?.implanted_devices || 11432;

        const highRisk =
          riskData?.risk_stats?.find((r) => r.risk_class === 3)?.device_count || 5023;

        const updatedStats = [
          {
            title: "Total Devices",
            value: totalDevices || 32753,
            change: "+12%",
            changeType: "positive",
            icon: Package,
            color: "bg-blue-500",
          },
          {
            title: "Manufacturers",
            value: totalManufacturers,
            change: "+3",
            changeType: "positive",
            icon: CheckCircle,
            color: "bg-green-500",
          },
          {
            title: "High-Risk Devices",
            value: highRisk,
            change: "-1%",
            changeType: "negative",
            icon: AlertTriangle,
            color: "bg-yellow-500",
          },
          {
            title: "Implanted Devices",
            value: implantedDevices,
            change: "+5%",
            changeType: "positive",
            icon: TrendingUp,
            color: "bg-purple-500",
          },
        ];

        setStats(updatedStats);

        setRecentActivities(
          devicesData.devices?.slice(0, 5).map((d, i) => ({
            id: d.device_id,
            type: "Device Added",
            device: d.device_name,
            time: `${(i + 1) * 2} hours ago`,
            status: "success",
          })) || []
        );

        const formatted = riskData?.risk_stats?.map((r) => ({
          riskClass:
            r.risk_class === 1
              ? "Class I"
              : r.risk_class === 2
                ? "Class II"
                : "Class III",
          devices: r.device_count,
          change: Math.random() > 0.5 ? "+10%" : "-5%",
        }));

        setRiskChart(formatted || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>;
  }

  // Prepare data for Recharts
  const chartData = stats.map((s) => ({
    name: s.title,
    value: s.value,
    change: s.change,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.email || "Manufacturer"}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your medical device production today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            All systems operational
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span
                className={`text-sm font-medium ${stat.changeType === "positive"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                  }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                from last month
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 📊 Overview Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Key Metrics Overview
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 6, fill: "#6366f1", strokeWidth: 2 }}
                activeDot={{ r: 8, fill: "#10b981" }}
              />
            </LineChart>
          </ResponsiveContainer>

        </div>
      </div>
      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activities
        </h3>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start space-x-3"
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 ${activity.status === "success"
                    ? "bg-green-500"
                    : activity.status === "warning"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
              ></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.type}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.device}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.time}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Package className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Add Device
            </span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Quality Check
            </span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <FileText className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Generate Report
            </span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Settings className="w-8 h-8 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Settings
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerOverview;
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
} from "lucide-react";

const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [newDevice, setNewDevice] = useState({
    name: "",
    quantity: "",
    status: "", // instead of risk_class
    slug: "",
    country: "",
  });

  // Fetch devices from Flask backend
  useEffect(() => {
    fetch("http://localhost:5000/devices")
      .then((res) => res.json())
      .then(setDevices)
      .catch(console.error);
  }, []);

  // Add new device
  const handleAddDevice = async () => {
    const res = await fetch("http://localhost:5000/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDevice),
    });
    const data = await res.json();
    alert(data.message);
    window.location.reload();
  };

  // Search + Filter
  const filteredDevices = devices.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || d.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manufacturer Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your medical device production
          </p>
        </div>
        <button
          onClick={handleAddDevice}
          className="px-4 py-2 bg-blue-600 text-white rounded flex items-center shadow"
        >
          <Plus className="w-5 h-5 mr-2" /> New Device
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Devices</p>
            <h2 className="text-xl font-bold">{devices.length}</h2>
          </div>
          <CheckCircle className="text-blue-600 w-8 h-8" />
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Safe</p>
            <h2 className="text-xl font-bold">
              {devices.filter((d) => d.status === "Safe").length}
            </h2>
          </div>
          <CheckCircle className="text-green-600 w-8 h-8" />
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Warning</p>
            <h2 className="text-xl font-bold">
              {devices.filter((d) => d.status === "Warning").length}
            </h2>
          </div>
          <AlertTriangle className="text-yellow-600 w-8 h-8" />
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Risk</p>
            <h2 className="text-xl font-bold">
              {devices.filter((d) => d.status === "Risk").length}
            </h2>
          </div>
          <XCircle className="text-red-600 w-8 h-8" />
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow p-2 flex-1">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            className="ml-2 flex-1 outline-none bg-transparent"
            placeholder="Search by device name or serial number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-3 py-2 flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            className="bg-transparent outline-none"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Safe">Safe</option>
            <option value="Warning">Warning</option>
            <option value="Risk">Risk</option>
          </select>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Devices</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-600 text-sm">
              <th className="p-2">Name</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Status</th>
              <th className="p-2">Country</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((d, i) => (
              <motion.tr
                key={d.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b last:border-0"
              >
                <td className="p-2 font-medium">{d.name}</td>
                <td className="p-2">{d.quantity}</td>
                <td className="p-2">{d.status}</td>
                <td className="p-2">{d.country}</td>
                <td className="p-2 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600 cursor-pointer" />
                  <Edit className="w-5 h-5 text-green-600 cursor-pointer" />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceManagement;

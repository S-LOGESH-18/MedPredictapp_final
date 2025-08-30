import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaHeartbeat, FaBell, FaFileAlt } from "react-icons/fa"; // Icons

function DeviceAnalysis() {
  const [devices, setDevices] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Load sample devices
  useEffect(() => {
    fetchSampleDevices();
  }, []);

  const fetchSampleDevices = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/devices/sample");
      setDevices(res.data.devices || []);
    } catch (err) {
      console.error("Error fetching sample devices:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/api/devices/search?q=${query}`
      );
      setDevices(res.data.devices || []);
    } catch (err) {
      console.error("Error searching devices:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* Search Bar */}
      <div className="flex w-full max-w-3xl mb-6">
        <input
          type="text"
          placeholder="Search by Device ID or Name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow px-4 py-2 border rounded-l-lg shadow-sm focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-r-lg shadow hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-gray-600 text-lg font-medium mb-6 animate-pulse">
          🔄 Loading devices...
        </div>
      )}

      {/* Device List */}
      {!loading && (
        <div className="flex flex-col w-full max-w-5xl space-y-4">
          {devices.length === 0 ? (
            <p className="text-gray-500 text-center">No devices found</p>
          ) : (
            devices.map((device, idx) => (
              <div
                key={device.ID || idx}
                className="flex items-center justify-between bg-white border rounded-xl shadow p-4 hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedDevice(device)}
              >
                {/* Device Info */}
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {device.NAME || device.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    ID: {device.ID || device.id}
                  </p>
                  <p className="text-sm text-gray-600">
                    Manufacturer:{" "}
                    {device.MANUFACTURER_NAME ||
                      device.manufacturer ||
                      "Unknown"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Last Check:{" "}
                    {device.LAST_UPDATED_AT || device.last_updated_at
                      ? new Date(
                          device.LAST_UPDATED_AT || device.last_updated_at
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                {/* Action Icons */}
                <div className="flex space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDevice({ ...device, action: "health" });
                    }}
                    className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                    title="Health Status"
                  >
                    <FaHeartbeat size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDevice({ ...device, action: "alert" });
                    }}
                    className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200"
                    title="Send Alert"
                  >
                    <FaBell size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDevice({ ...device, action: "report" });
                    }}
                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                    title="Generate Report"
                  >
                    <FaFileAlt size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Popup */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {selectedDevice.action === "health" && "Health Status"}
              {selectedDevice.action === "alert" && "Send Alert"}
              {selectedDevice.action === "report" && "Generate Report"}
              {!selectedDevice.action && "Device Details"}
            </h2>

            <div className="text-gray-700 space-y-2">
              <p>
                <strong>Name:</strong>{" "}
                {selectedDevice.NAME || selectedDevice.name}
              </p>
              <p>
                <strong>ID:</strong> {selectedDevice.ID || selectedDevice.id}
              </p>
              <p>
                <strong>Manufacturer:</strong>{" "}
                {selectedDevice.MANUFACTURER_NAME ||
                  selectedDevice.manufacturer ||
                  "Unknown"}
              </p>
              <p>
                <strong>Last Check:</strong>{" "}
                {selectedDevice.LAST_UPDATED_AT ||
                selectedDevice.last_updated_at
                  ? new Date(
                      selectedDevice.LAST_UPDATED_AT ||
                        selectedDevice.last_updated_at
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            {/* Close button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedDevice(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeviceAnalysis;

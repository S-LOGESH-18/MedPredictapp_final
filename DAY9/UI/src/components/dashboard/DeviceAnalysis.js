import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaHeartbeat, FaBell, FaFileAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function DeviceAnalysis() {
  const [devices, setDevices] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // For Health Analysis
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate(); // <-- hook for navigation

  // -------------------
  // Fetch sample devices
  // -------------------
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

  // -------------------
  // 🔍 Fetch Device Info & Prediction
  // -------------------
  const fetchDeviceAnalysis = async (deviceId) => {
    setAnalysis(null);
    setAnalysisLoading(true);
    setMessage(null);

    try {
      const infoRes = await fetch(`http://127.0.0.1:5000/api/device/${deviceId}`);
      if (!infoRes.ok) throw new Error("Device info fetch failed");
      const infoData = await infoRes.json();

      const predRes = await fetch(`http://127.0.0.1:7000/predict/${deviceId}`);
      if (!predRes.ok) throw new Error("Prediction fetch failed");
      const predData = await predRes.json();

      setAnalysis({ info: infoData, prediction: predData });
      setMessage({ type: "success", text: `✅ Analysis for Device ${deviceId}` });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setAnalysisLoading(false);
    }
  };

  // -------------------
  // 📊 Render Table
  // -------------------
  const renderTable = (title, data) => {
    if (!data || data.length === 0) return null;
    const columns = Object.keys(data[0]);
    return (
      <div className="mb-6">
        <h3 className="mb-2 font-semibold text-gray-800">{title}</h3>
        <table className="w-full border-collapse shadow rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 text-left">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                {columns.map((col) => (
                  <td key={col} className="px-3 py-2 border-b text-sm">
                    {row[col] !== null ? row[col].toString() : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // -------------------
  // 🧠 Render Prediction
  // -------------------
  const renderPrediction = () => {
    if (!analysis?.prediction) return null;

    const pred = analysis.prediction;
    const isRisk = pred.failure_prediction === 1;
    const boxStyle = isRisk
      ? "bg-red-100 border border-red-300 text-red-700"
      : "bg-green-100 border border-green-300 text-green-700";

    return (
      <div className={`p-4 rounded-lg mt-4 ${boxStyle}`}>
        <h3 className="font-semibold mb-2">🤖 Prediction Result</h3>
        <p><b>Device ID:</b> {pred.device_id}</p>
        <p>
          {isRisk
            ? "⚠️ High Risk: This device may fail within 50 days."
            : "✅ Low Risk: Device stable beyond 50 days."}
        </p>
        <p><b>Confidence:</b> {pred.risk_percentage}%</p>
        <p><b>Threshold:</b> {pred.within_50_days === "Yes" ? "⚠️ Within 50 days" : "✅ Safe"} </p>
      </div>
    );
  };

  // -------------------
  // 🎨 UI
  // -------------------
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

      {/* Loading */}
      {loading && <div className="text-gray-600 mb-6">🔄 Loading devices...</div>}

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
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {device.NAME || device.name}
                  </h3>
                  <p className="text-sm text-gray-600">ID: {device.ID || device.id}</p>
                  <p className="text-sm text-gray-600">
                    Manufacturer: {device.MANUFACTURER_NAME || device.manufacturer || "Unknown"}
                  </p>
                </div>

                {/* Action Icons */}
                <div className="flex space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchDeviceAnalysis(device.ID || device.id);
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
                      navigate("/alert"); // <-- navigate to /alert page
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

      {/* Modal */}
      {selectedDevice && selectedDevice.action !== "alert" && ( // alert now navigates, not modal
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {selectedDevice.action === "health" && "Health Analysis"}
              {selectedDevice.action === "report" && "Generate Report"}
              {!selectedDevice.action && "Device Details"}
            </h2>

            {/* Health Analysis */}
            {selectedDevice.action === "health" && (
              <div>
                {analysisLoading && <p>⏳ Running analysis...</p>}
                {message && (
                  <div
                    className={`mb-4 p-2 rounded ${
                      message.type === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {message.text}
                  </div>
                )}
                {analysis?.info?.device && renderTable("📱 Device Info", analysis.info.device)}
                {analysis?.info?.events && renderTable("📅 Related Events", analysis.info.events)}
                {analysis?.info?.manufacturers &&
                  renderTable("🏭 Manufacturers", analysis.info.manufacturers)}
                {renderPrediction()}
              </div>
            )}

            {/* Report */}
            {selectedDevice.action === "report" && (
              <p className="text-gray-600">📄 Report generation coming soon</p>
            )}

            {/* Close button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setSelectedDevice(null);
                  setAnalysis(null);
                  setMessage(null);
                }}
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

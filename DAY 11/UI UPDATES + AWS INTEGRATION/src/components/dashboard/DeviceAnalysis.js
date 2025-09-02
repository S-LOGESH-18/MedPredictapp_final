import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaHeartbeat, FaFileAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function DeviceAnalysis() {
  const [devices, setDevices] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Health Analysis
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Persist ALL analyses
  const [allAnalyses, setAllAnalyses] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);

  const navigate = useNavigate();

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

  // -------------------
  // 📄 Open HTML Report (Flask)
  // -------------------
  const openBackendReport = (deviceId) => {
    if (!deviceId) return;
    const url = `http://127.0.0.1:5000/report/${deviceId}`;
    window.open(url, "_blank", "noopener,noreferrer");
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
  // 🔍 Fetch Device Info, Prediction, Company + Manufacturer Details
  // -------------------
  const fetchDeviceAnalysis = async (deviceId, companyId, manufacturerId) => {
    setAnalysis(null);
    setAnalysisLoading(true);
    setMessage(null);

    try {
      // 1. Device Info
      const infoRes = await fetch(`http://127.0.0.1:5000/api/device/${deviceId}`);
      if (!infoRes.ok) throw new Error("Device info fetch failed");
      const infoData = await infoRes.json();

      // 2. Prediction
      const predRes = await fetch(`http://127.0.0.1:5000/predict/${deviceId}`);
      if (!predRes.ok) throw new Error("Prediction fetch failed");
      const predData = await predRes.json();

      // 3. Company Details + Events (use manufacturer_id from device info)
      let compData = null;
      if (infoData.MANUFACTURER_ID) {
        try {
          const compRes = await fetch(
            `http://127.0.0.1:5000/api/company/${infoData.MANUFACTURER_ID}/details`
          );
          if (compRes.ok) {
            compData = await compRes.json();
            if (compData.company) {
              setCompanies((prev) => [...prev, compData.company]);
            }
          }
        } catch (compErr) {
          console.error("Company details fetch failed:", compErr);
        }
      }

      // 4. Manufacturer Details + Events
      let manuData = null;
      if (manufacturerId) {
        try {
          const manuRes = await fetch(
            `http://127.0.0.1:5000/api/company/${manufacturerId}/details`
          );
          if (manuRes.ok) {
            manuData = await manuRes.json();
            if (manuData.manufacturer) {
              setManufacturers((prev) => [...prev, manuData.manufacturer]);
            }
          }
        } catch (manuErr) {
          console.error("Manufacturer details fetch failed:", manuErr);
        }
      }

      // Save everything
      const result = {
        deviceId,
        companyId,
        info: infoData,
        prediction: predData,
        company: compData?.company || {},
        devices: compData?.devices || [],
        events: compData?.events || [],
        manufacturer: manuData?.manufacturer || {},
        manuDevices: manuData?.devices || [],
        manuEvents: manuData?.events || [],
      };

      // Store latest
      setAnalysis(result);

      // Append to collection
      setAllAnalyses((prev) => [...prev, result]);

      // ✅ Toast
      toast.success(`Device ${deviceId} analysis saved ✅`, {
        position: "top-right",
        autoClose: 2500,
      });

      setMessage({ type: "success", text: `✅ Analysis for Device ${deviceId}` });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      toast.error("Prediction failed ❌");
    } finally {
      setAnalysisLoading(false);
    }
  };

  // -------------------
  // 📊 Reusable Table Renderer
  // -------------------
  const renderTable = (title, data) => {
    if (!data) return null;
    let rows = data;
    if (!Array.isArray(rows)) {
      rows = [rows];
    }
    if (rows.length === 0) return null;

    return (
      <div className="mt-4">
        <h3 className="mb-2 font-semibold text-gray-800">{title}</h3>
        <div className="border rounded-lg p-4 bg-gray-50">
          {rows.map((row, i) => (
            <div
              key={i}
              className={`mb-4 p-3 rounded-lg ${i % 2 === 0 ? "bg-white" : "bg-gray-100"
                }`}
            >
              {Object.entries(row).map(([key, value]) => (
                <div key={key} className="flex text-sm py-1 border-b border-gray-200 last:border-none">
                  <span className="font-medium text-gray-700 w-40">{key}</span>
                  <span className="text-gray-900">{value !== null && value !== undefined ? String(value) : "-"}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // -------------------
  // 📊 Render Prediction
  // -------------------
  const renderPrediction = () => {
    if (!analysis?.prediction) return null;

    const pred = analysis.prediction;
    const isRisk = pred.failure_prediction === 1;
    const boxStyle = isRisk
      ? "bg-red-100 border border-red-300 text-red-700"
      : "bg-green-100 border border-green-300 text-green-700";

    return (
      <div
        className={`p-4 rounded-2xl mt-4 shadow-md ${pred.within_50_days === "Yes" ? "bg-red-100 border border-red-400" : "bg-green-100 border border-green-400"
          }`}
      >
        <h3 className="font-bold text-lg mb-2">🔍 Device Health Check</h3>
        <p className="mb-2">
          <b>Device ID:</b> {pred.device_id}
        </p>

        {pred.within_50_days === "Yes" ? (
          <div className="text-red-700 font-semibold text-base">
            ⚠️ Warning: This device is at <b>HIGH RISK</b> of failure within 50 days.
          </div>
        ) : (
          <div className="text-green-700 font-semibold text-base">
            ✅ Good: This device is <b>SAFE</b> for more than 50 days.
          </div>
        )}
      </div>

    );
  };

  // -------------------
  // 🎨 UI
  // -------------------
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <ToastContainer />

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
                      fetchDeviceAnalysis(
                        device.ID || device.id,
                        device.COMPANY_ID || device.company_id,
                        device.MANUFACTURER_ID || device.manufacturer_id
                      );
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
                      const currentId = device.ID || device.id;
                      let targetId = currentId;
                      if (!targetId && allAnalyses.length > 0) {
                        const latest = allAnalyses[allAnalyses.length - 1];
                        targetId =
                          latest?.deviceId ||
                          latest?.info?.device?.ID ||
                          latest?.info?.device?.id;
                      }
                      if (!targetId) {
                        toast.error("❌ Could not determine device ID for report");
                        return;
                      }
                      openBackendReport(targetId);
                    }}
                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                    title="View Report"
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
      {selectedDevice && selectedDevice.action === "health" && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Health Analysis</h2>

            {analysisLoading && <p>⏳ Running analysis...</p>}
            {message && (
              <div
                className={`mb-4 p-2 rounded ${message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                  }`}
              >
                {message.text}
              </div>
            )}
            {renderPrediction()}

            {/* Tables */}
            {renderTable("📱 Device Info", analysis?.info?.device)}

            {/* Actions */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => {
                  const payload = {
                    device: analysis?.info?.device,
                    events: analysis?.info?.events,
                    company: analysis?.company,
                    companyEvents: analysis?.events,
                    manufacturer: analysis?.manufacturer,
                    manuEvents: analysis?.manuEvents,
                    prediction: analysis?.prediction,
                    autoprint: false,
                  };
                  const did =
                    analysis?.prediction?.device_id ||
                    analysis?.info?.device?.ID ||
                    selectedDevice?.ID ||
                    selectedDevice?.id;

                  try {
                    const form = document.createElement("form");
                    form.method = "POST";
                    form.action = `http://127.0.0.1:5000/report/view`;
                    form.target = "_blank";

                    const hidden = document.createElement("input");
                    hidden.type = "hidden";
                    hidden.name = "payload";
                    hidden.value = JSON.stringify(payload);
                    form.appendChild(hidden);

                    const printFlag = document.createElement("input");
                    printFlag.type = "hidden";
                    printFlag.name = "autoprint";
                    printFlag.value = "0";
                    form.appendChild(printFlag);

                    document.body.appendChild(form);
                    form.submit();
                    document.body.removeChild(form);
                  } catch (e) {
                    if (did) openBackendReport(did);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                View Full Report
              </button>
            </div>

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

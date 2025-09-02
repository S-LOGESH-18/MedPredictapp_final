import React, { useState, useEffect } from "react";
import { Upload, Eye, Download, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://127.0.0.1:5000";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [count, setCount] = useState(0);
  const [file, setFile] = useState(null);
  const [filters, setFilters] = useState({ from: "", to: "" });

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/list`);
      const data = await res.json();
      setReports(data || []); // your backend returns array
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  const fetchCount = async () => {
    try {
      const res = await fetch(`${API_BASE}/list`);
      const data = await res.json();
      setCount(data.length || 0);
    } catch (err) {
      console.error("Error fetching count:", err);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warning("Please select a PDF file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("✅ File uploaded successfully!");
        setFile(null);
        fetchReports();
        fetchCount();
      } else {
        toast.error(`❌ Upload failed: ${result.error || "Unknown error"}`);
      }
    } catch (err) {
      toast.error("❌ Upload failed. Check server connection.");
    }
  };

  const handleDelete = async (key) => {
    try {
      const res = await fetch(`${API_BASE}/delete?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (res.ok) {
        toast.info("🗑️ File deleted successfully!");
        fetchReports();
        fetchCount();
      } else {
        toast.error(`❌ Delete failed: ${result.error || "Unknown error"}`);
      }
    } catch (err) {
      toast.error("❌ Delete failed. Check server connection.");
    }
  };

  const getPresigned = async (key, disposition) => {
    const res = await fetch(
      `${API_BASE}/presign?key=${encodeURIComponent(key)}&disposition=${disposition}`
    );
    const data = await res.json();
    if (data.url) {
      window.open(data.url, "_blank");
    } else {
      toast.error("❌ Failed to generate presigned URL.");
    }
  };

  const getRisk = (key) => {
    if (key.includes("risk_1")) return { label: "High", color: "bg-red-500" };
    if (key.includes("risk_2")) return { label: "Moderate", color: "bg-yellow-500" };
    if (key.includes("risk_3")) return { label: "Safe", color: "bg-green-500" };
    return { label: "Unknown", color: "bg-gray-500" };
  };

  useEffect(() => {
    fetchReports();
    fetchCount();
  }, []);

  return (
    <div className="p-6">
      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports ({count})</h1>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="block text-sm text-gray-500 
                       file:mr-3 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-600
                       hover:file:bg-blue-100"
          />
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" /> Upload
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">File Name</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No reports found
                </td>
              </tr>
            ) : (
              reports.map((r, i) => {
                const risk = getRisk(r.filename);
                return (
                  <tr
                    key={i}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{r.filename}</td>
                    <td className="px-4 py-3">{(r.size / 1024).toFixed(1)} KB</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-white text-xs rounded ${risk.color}`}
                      >
                        {risk.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-3 justify-center">
                      <button
                        onClick={() => getPresigned(r.filename, "inline")}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye />
                      </button>
                      <button
                        onClick={() => getPresigned(r.filename, "attachment")}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Download />
                      </button>
                      <button
                        onClick={() => handleDelete(r.filename)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Reports;

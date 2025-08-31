import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReportPage = () => {
  const { deviceId } = useParams(); // from route /report/:deviceId
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch full report from backend
  useEffect(() => {
    setLoading(true);
    fetch(`http://127.0.0.1:5000/api/device/${deviceId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch report data");
        return res.json();
      })
      .then((data) => {
        setReportData(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error loading report:", err);
        setError(err.message || "Something went wrong");
      })
      .finally(() => setLoading(false));
  }, [deviceId]);

  if (loading) {
    return <div className="p-6 text-gray-600">⏳ Loading report...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">❌ {error}</div>;
  }

  if (!reportData) {
    return <div className="p-6 text-gray-600">No report data available.</div>;
  }

  const { device, company, events, prediction } = reportData;

  // Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("📊 Device Risk Report", 14, 15);

    // Device Info
    doc.setFontSize(12);
    doc.text("1. Device Information", 14, 25);
    autoTable(doc, {
      startY: 30,
      head: [["Field", "Value"]],
      body: Object.entries(device || {}).map(([k, v]) => [k, String(v ?? "")]),
    });

    // Company Info
    doc.text("2. Manufacturer Information", 14, doc.lastAutoTable.finalY + 10);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [["Field", "Value"]],
      body: Object.entries(company || {}).map(([k, v]) => [k, String(v ?? "")]),
    });

    // Events
    if (events && events.length > 0) {
      doc.text("3. Events / Recalls", 14, doc.lastAutoTable.finalY + 10);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [["ID", "Action", "Summary", "Status", "Date"]],
        body: events.map((e) => [
          e.ID,
          e.ACTION,
          e.ACTION_SUMMARY,
          e.STATUS,
          e.DATE_UPDATED,
        ]),
        styles: { fontSize: 8, cellWidth: "wrap" },
      });
    }

    // Prediction
    if (prediction) {
      doc.text("4. Prediction Result", 14, doc.lastAutoTable.finalY + 10);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [["Field", "Value"]],
        body: Object.entries(prediction).map(([k, v]) => [k, String(v ?? "")]),
      });
    }

    doc.save("device_risk_report.pdf");
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">📄 Device Risk Report</h2>

      {/* Device Info */}
      <section className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2">Device Information</h3>
        <ul className="text-sm text-gray-700">
          {Object.entries(device || {}).map(([k, v]) => (
            <li key={k} className="border-b py-1">
              <strong>{k}:</strong> {String(v ?? "-")}
            </li>
          ))}
        </ul>
      </section>

      {/* Company Info */}
      <section className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2">Manufacturer</h3>
        <ul className="text-sm text-gray-700">
          {Object.entries(company || {}).map(([k, v]) => (
            <li key={k} className="border-b py-1">
              <strong>{k}:</strong> {String(v ?? "-")}
            </li>
          ))}
        </ul>
      </section>

      {/* Events */}
      {events?.length > 0 && (
        <section className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Events / Recalls</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            {events.map((e, i) => (
              <li key={i} className="border p-2 rounded bg-gray-50">
                <div><strong>ID:</strong> {e.ID}</div>
                <div><strong>Action:</strong> {e.ACTION}</div>
                <div><strong>Summary:</strong> {e.ACTION_SUMMARY}</div>
                <div><strong>Status:</strong> {e.STATUS}</div>
                <div><strong>Date:</strong> {e.DATE_UPDATED}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Prediction */}
      {prediction && (
        <section className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Prediction</h3>
          <ul className="text-sm text-gray-700">
            {Object.entries(prediction).map(([k, v]) => (
              <li key={k} className="border-b py-1">
                <strong>{k}:</strong> {String(v ?? "-")}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Download PDF */}
      <button
        onClick={generatePDF}
        className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
      >
        📥 Download PDF
      </button>
    </div>
  );
};

export default ReportPage;

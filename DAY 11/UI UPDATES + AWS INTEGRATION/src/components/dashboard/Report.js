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

  // ✅ Reusable key-value renderer
  const renderKeyValueTable = (data) => (
    <table className="w-full border rounded-lg overflow-hidden">
      <tbody>
        {Object.entries(data || {}).map(([k, v]) => (
          <tr key={k} className="odd:bg-gray-50 even:bg-white border-b">
            <td className="px-3 py-2 font-medium text-gray-700 w-1/3 capitalize">
              {k.replace(/_/g, " ")}
            </td>
            <td className="px-3 py-2 text-gray-800">{String(v ?? "-")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">📄 Device Risk Report</h2>

      {/* Device Info */}
      <section className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-3">Device Information</h3>
        {renderKeyValueTable(device)}
      </section>

      {/* Company Info */}
      <section className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-3">Manufacturer</h3>
        {renderKeyValueTable(company)}
      </section>

      {/* Events */}
      {events?.length > 0 && (
        <section className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-3">Events / Recalls</h3>
          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg overflow-hidden text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Action</th>
                  <th className="px-3 py-2 text-left">Summary</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e, i) => (
                  <tr key={i} className="odd:bg-gray-50 even:bg-white border-b">
                    <td className="px-3 py-2">{e.ID}</td>
                    <td className="px-3 py-2">{e.ACTION}</td>
                    <td className="px-3 py-2">{e.ACTION_SUMMARY}</td>
                    <td className="px-3 py-2">{e.STATUS}</td>
                    <td className="px-3 py-2">{e.DATE_UPDATED}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Prediction */}
      {prediction && (
        <section className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-3">Prediction</h3>
          {renderKeyValueTable(prediction)}
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

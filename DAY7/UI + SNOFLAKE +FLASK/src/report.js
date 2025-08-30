import React, { useRef, useState } from "react";
import { Bell, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./reprot.css"

const  ReportModal = ({ show, onClose, device, event, manufacturer }) => {
  const contentRef = useRef(null);
  const [generating, setGenerating] = useState(false);

  if (!show) return null;

  const handleNotify = () => {
    alert("Notification triggered (placeholder)");
  };

  const handleDownload = async () => {
    if (!contentRef.current) return;
    setGenerating(true);

    // Capture only the report content. html2canvas ignores elements
    // where ignoreElements returns true (we use class 'no-print').
    const canvas = await html2canvas(contentRef.current, {
      scale: 2,
      useCORS: true,
      ignoreElements: (el) => el.classList && el.classList.contains("no-print"),
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // size of the image in pdf units (mm)
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = pdfWidth;
    const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;

    let heightLeft = imgHeight;
    let position = 0;

    // first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // add additional pages (snapshots of the same image offset)
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const filename = `report_${device?.device_id || "report"}.pdf`;
    pdf.save(filename);

    setGenerating(false);
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Buttons inside modal (these have class no-print so they won't appear in the PDF) */}
        <div className="modal-action-row">
          <button
            className="download-btn no-print"
            onClick={handleDownload}
            disabled={generating}
          >
            <Download size={16} /> {generating ? "Generating..." : "Download"}
          </button>

          <button className="notification-btn no-print" onClick={handleNotify}>
            <Bell size={16} /> Notify
          </button>
        </div>

        {/* Report content to capture */}
        <div className="report-container" ref={contentRef}>
          <div className="report-title">
            <h1>ABC PEROT – DEVICE INCIDENT REPORT</h1>
            <div className="report-meta">
              <div>
                <strong>Original Date:</strong> 2022-03-15
              </div>
              <div>
                <strong>Date Revised:</strong> 2023-01-10
              </div>
            </div>
          </div>

          <section className="report-section">
            <h2>Reporter Information</h2>
            <table className="report-table">
              <tbody>
                <tr>
                  <td><strong>Device ID</strong></td>
                  <td>{device?.device_id}</td>
                </tr>
                <tr>
                  <td><strong>Manufacturer</strong></td>
                  <td>{manufacturer?.name}</td>
                </tr>
                <tr>
                  <td><strong>Country</strong></td>
                  <td>{manufacturer?.country}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="report-section">
            <h2>Incident Information</h2>
            <table className="report-table">
              <tbody>
                <tr>
                  <td><strong>Event Type</strong></td>
                  <td>{event?.event_type}</td>
                </tr>
                <tr>
                  <td><strong>Date of Incident</strong></td>
                  <td>{event?.event_date}</td>
                </tr>
                <tr>
                  <td><strong>Details</strong></td>
                  <td>{event?.reason}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="report-section">
            <h2>Medical Device Information</h2>
            <table className="report-table">
              <tbody>
                <tr>
                  <td><strong>Device Name</strong></td>
                  <td>{device?.device_name}</td>
                </tr>
                <tr>
                  <td><strong>Device Class</strong></td>
                  <td>{device?.class}</td>
                </tr>
                <tr>
                  <td><strong>Approval Date</strong></td>
                  <td>{device?.approval_date}</td>
                </tr>
                <tr>
                  <td><strong>Category</strong></td>
                  <td>{device?.category}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="report-section">
            <h2>Manufacturer Information</h2>
            <table className="report-table">
              <tbody>
                <tr>
                  <td><strong>Manufacturer ID</strong></td>
                  <td>{manufacturer?.manufacturer_id}</td>
                </tr>
                <tr>
                  <td><strong>History of Recalls</strong></td>
                  <td>{manufacturer?.recall_history}</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
};
export default ReportModal;
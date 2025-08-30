import { useState, useRef } from "react";
import ReportModal from "./report";
import "./reprot.css";

const sampleDevices = [
  {
    device_id: "DVC12345",
    device_name: "Heart Monitor",
    class: "2",
    approval_date: "2018-05-10",
    category: "Monitoring Equipment",
  },
];

const sampleEvent = {
  event_type: "Recall",
  event_date: "2022-03-15",
  reason: "Battery overheating issue",
};

const sampleManufacturer = {
  manufacturer_id: "MNF67890",
  name: "MediTech Corp.",
  country: "Canada",
  recall_history: "3 Recalls in last 5 years",
};

function RApp() {
  const [query, setQuery] = useState("");
  const [foundDevice, setFoundDevice] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const contentRef = useRef(null);

  const handleSearch = () => {
    const device = sampleDevices.find(
      (d) => d.device_id.toLowerCase() === query.trim().toLowerCase()
    );
    if (!device) {
      alert("Device ID not found. Try DVC12345 for the demo.");
      return;
    }
    setFoundDevice(device);
    setOpenModal(true);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Device Report System</h2>

      {/* Search Bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Enter Device ID (e.g. DVC12345)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: 8, width: 300 }}
        />
        <button className="download-btn" onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* Display modal if device is found */}
      {foundDevice && (
        <ReportModal
          show={openModal}
          onClose={() => setOpenModal(false)}
          device={foundDevice}
          event={sampleEvent}
          manufacturer={sampleManufacturer}
          contentRef={contentRef}
        />
      )}
    </div>
  );
}

export default RApp;
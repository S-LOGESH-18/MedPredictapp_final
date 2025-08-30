import React, { useState } from "react";

function App() {
  const [deviceId, setDeviceId] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSearch = async () => {
    if (!deviceId) {
      setMessage({ type: "error", text: "⚠️ Please enter a Device ID" });
      return;
    }

    setLoading(true);
    setMessage(null);
    setResults(null);

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/device/${deviceId}`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

      const data = await response.json();
      setResults(data);
      setMessage({ type: "success", text: `✅ Device ${deviceId} details fetched successfully` });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (title, data) => {
    if (!data || data.length === 0) return null;
    const columns = Object.keys(data[0]);
    return (
      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "10px", color: "#333" }}>{title}</h3>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <thead style={{ backgroundColor: "#007bff", color: "#fff" }}>
            <tr>
              {columns.map((col) => (
                <th key={col} style={{ padding: "10px", textAlign: "left" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                style={{
                  backgroundColor: i % 2 === 0 ? "#f9f9f9" : "#fff",
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    style={{
                      padding: "8px 10px",
                      borderBottom: "1px solid #ddd",
                      fontSize: "14px",
                    }}
                  >
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

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px", color: "#007bff" }}>🔍 Search Device Details</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Enter Device ID"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            fontSize: "14px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: "10px 18px",
            fontSize: "14px",
            backgroundColor: loading ? "#6c757d" : "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => !loading && (e.target.style.backgroundColor = "#0056b3")}
          onMouseOut={(e) => !loading && (e.target.style.backgroundColor = "#007bff")}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {message && (
        <div
          style={{
            marginTop: "10px",
            padding: "12px",
            borderRadius: "5px",
            fontSize: "14px",
            backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da",
            color: message.type === "success" ? "#155724" : "#721c24",
            border: `1px solid ${message.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ marginTop: "25px" }}>
        {results?.device && renderTable("📱 Device Info", results.device)}
        {results?.events && renderTable("📅 Related Events", results.events)}
        {results?.manufacturers && renderTable("🏭 Manufacturers", results.manufacturers)}
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import axios from "axios";

function UploadPdf() {
  const [file, setFile] = useState(null);
  const [pdfs, setPdfs] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Select a PDF file first!");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.message);
      fetchPdfs();
    } catch (err) {
      alert("Upload failed: " + err.response?.data?.error || err.message);
    }
  };

  const fetchPdfs = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/list");
      setPdfs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload PDF to S3</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      <h3>Stored PDFs:</h3>
      <ul>
        {pdfs.map((pdf, idx) => (
          <li key={idx}>
            <a href={pdf.url} target="_blank" rel="noopener noreferrer">
              {pdf.filename}
            </a> ({(pdf.size / 1024).toFixed(2)} KB)
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UploadPdf;

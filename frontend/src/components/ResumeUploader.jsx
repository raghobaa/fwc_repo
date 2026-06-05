import { useState, useRef } from "react";

const API_BASE = process.env.REACT_APP_RESUME_AI_API_URL || "http://localhost:5009/api";

export default function ResumeUploader({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const folderInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return;

    const resumeFiles = Array.from(files).filter((f) => {
      const ext = f.name.split(".").pop().toLowerCase();
      return ["pdf", "docx"].includes(ext);
    });

    if (resumeFiles.length === 0) {
      alert("No supported resume files found (PDF, DOCX)");
      return;
    }

    setUploading(true);
    setResults(null);

    const formData = new FormData();
    resumeFiles.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResults(data);
      if (onUploadComplete) onUploadComplete(data);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFolderSelect = (e) => uploadFiles(e.target.files);
  const handleFileSelect = (e) => uploadFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const items = e.dataTransfer.items;
    const files = [];
    for (let item of items) {
      const entry = item.webkitGetAsEntry?.();
      if (entry) {
        if (entry.isFile) files.push(item.getAsFile());
      }
    }
    if (files.length > 0) uploadFiles(files);
    else uploadFiles(e.dataTransfer.files);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📂 Upload Resumes</h2>
      <p style={styles.subtitle}>Upload a folder or individual resume files (PDF, DOCX)</p>

      {/* Drop Zone */}
      <div
        style={{ ...styles.dropZone, ...(dragOver ? styles.dropZoneActive : {}) }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div style={styles.dropIcon}>📄</div>
        <p style={styles.dropText}>Drag & drop a folder or files here</p>
        <p style={styles.dropOr}>— or —</p>

        <div style={styles.btnRow}>
          {/* Folder Upload */}
          <button style={styles.btn} onClick={() => folderInputRef.current.click()} disabled={uploading}>
            📁 Select Folder
          </button>
          <input
            ref={folderInputRef}
            type="file"
            webkitdirectory="true"
            directory="true"
            multiple
            style={{ display: "none" }}
            onChange={handleFolderSelect}
          />

          {/* Individual Files */}
          <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => fileInputRef.current.click()} disabled={uploading}>
            📎 Select Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div style={styles.progressBox}>
          <div style={styles.spinner} />
          <span>Processing resumes... extracting text and generating embeddings</span>
        </div>
      )}

      {/* Results */}
      {results && (
        <div style={styles.results}>
          <h3 style={styles.resultsTitle}>Upload Complete</h3>
          <div style={styles.summaryRow}>
            <span style={{ ...styles.badge, background: "#22c55e" }}>✅ {results.summary.success} Success</span>
            <span style={{ ...styles.badge, background: "#ef4444" }}>❌ {results.summary.failed} Failed</span>
            <span style={{ ...styles.badge, background: "#f59e0b" }}>⏭ {results.summary.skipped} Skipped</span>
          </div>
          <div style={styles.detailList}>
            {results.details.map((r, i) => (
              <div key={i} style={styles.detailItem}>
                <span style={styles.detailFile}>{r.filename}</span>
                <span style={{
                  ...styles.detailStatus,
                  color: r.status === "success" || r.status === "updated" ? "#22c55e" : r.status === "skipped" ? "#f59e0b" : "#ef4444"
                }}>
                  {r.status} {r.reason ? `(${r.reason})` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "24px", fontFamily: "system-ui, sans-serif" },
  title: { fontSize: "20px", fontWeight: 700, marginBottom: "4px", color: "#1e293b" },
  subtitle: { fontSize: "14px", color: "#64748b", marginBottom: "20px" },
  dropZone: {
    border: "2px dashed #cbd5e1", borderRadius: "12px", padding: "40px 20px",
    textAlign: "center", transition: "all 0.2s", background: "#f8fafc", cursor: "pointer"
  },
  dropZoneActive: { border: "2px dashed #6366f1", background: "#eef2ff" },
  dropIcon: { fontSize: "40px", marginBottom: "12px" },
  dropText: { fontSize: "16px", color: "#475569", margin: "0 0 8px" },
  dropOr: { fontSize: "13px", color: "#94a3b8", margin: "0 0 16px" },
  btnRow: { display: "flex", gap: "12px", justifyContent: "center" },
  btn: {
    padding: "10px 20px", background: "#6366f1", color: "#fff", border: "none",
    borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px"
  },
  btnSecondary: { background: "#0f172a" },
  progressBox: {
    display: "flex", alignItems: "center", gap: "12px", marginTop: "16px",
    padding: "14px 18px", background: "#f0f9ff", borderRadius: "8px", color: "#0369a1", fontSize: "14px"
  },
  spinner: {
    width: "18px", height: "18px", border: "3px solid #bae6fd",
    borderTopColor: "#0369a1", borderRadius: "50%", animation: "spin 0.8s linear infinite"
  },
  results: { marginTop: "20px" },
  resultsTitle: { fontSize: "16px", fontWeight: 700, marginBottom: "12px", color: "#1e293b" },
  summaryRow: { display: "flex", gap: "10px", marginBottom: "14px" },
  badge: { padding: "4px 12px", borderRadius: "20px", color: "#fff", fontSize: "13px", fontWeight: 600 },
  detailList: { maxHeight: "200px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" },
  detailItem: {
    display: "flex", justifyContent: "space-between", padding: "8px 14px",
    borderBottom: "1px solid #f1f5f9", fontSize: "13px"
  },
  detailFile: { color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" },
  detailStatus: { fontWeight: 600 }
};

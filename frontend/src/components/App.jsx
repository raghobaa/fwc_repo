import React from "react";
import { useState } from "react";
import ResumeUploader from "./ResumeUploader";
import HRChatbot from "./HRChatbot";

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [uploadCount, setUploadCount] = useState(0);

  const handleUploadComplete = (data) => {
    setUploadCount((prev) => prev + data.summary.success);
  };

  return (
    <div style={styles.app}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🏢</span>
          <span style={styles.logoText}>HRMS</span>
        </div>

        <nav style={styles.nav}>
          <button
            style={{ ...styles.navBtn, ...(activeTab === "chat" ? styles.navBtnActive : {}) }}
            onClick={() => setActiveTab("chat")}
          >
            💬 HR Chatbot
          </button>
          <button
            style={{ ...styles.navBtn, ...(activeTab === "upload" ? styles.navBtnActive : {}) }}
            onClick={() => setActiveTab("upload")}
          >
            📂 Upload Resumes
            {uploadCount > 0 && <span style={styles.badge}>{uploadCount}</span>}
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.footerText}>Powered by</div>
          <div style={styles.footerGemini}>✨ Gemini AI</div>
        </div>
      </div>

      <div style={styles.main}>
        {activeTab === "chat" && <HRChatbot />}
        {activeTab === "upload" && <ResumeUploader onUploadComplete={handleUploadComplete} />}
      </div>
    </div>
  );
}

const styles = {
  app: { display: "flex", height: "100vh", fontFamily: "system-ui, sans-serif", background: "#f8fafc" },
  sidebar: {
    width: "220px", background: "#1e293b", display: "flex", flexDirection: "column",
    padding: "20px 0", flexShrink: 0
  },
  logo: { display: "flex", alignItems: "center", gap: "10px", padding: "0 20px 24px" },
  logoIcon: { fontSize: "24px" },
  logoText: { color: "#fff", fontWeight: 800, fontSize: "20px", letterSpacing: "1px" },
  nav: { display: "flex", flexDirection: "column", gap: "4px", padding: "0 12px" },
  navBtn: {
    display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px",
    background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer",
    borderRadius: "8px", fontSize: "14px", fontWeight: 500, textAlign: "left"
  },
  navBtnActive: { background: "#334155", color: "#fff" },
  badge: {
    marginLeft: "auto", background: "#6366f1", color: "#fff",
    borderRadius: "10px", padding: "1px 8px", fontSize: "11px", fontWeight: 700
  },
  sidebarFooter: { marginTop: "auto", padding: "20px", borderTop: "1px solid #334155" },
  footerText: { fontSize: "11px", color: "#64748b", marginBottom: "4px" },
  footerGemini: { fontSize: "13px", color: "#a5b4fc", fontWeight: 600 },
  main: { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }
};

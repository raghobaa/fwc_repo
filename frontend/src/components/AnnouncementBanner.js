import React, { useEffect, useState } from "react";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const PRIORITY_STYLES = {
  High: { bar: "bg-red-600", badge: "bg-red-100 text-red-700", icon: "🔴" },
  Medium: { bar: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700", icon: "🟡" },
  Low: { bar: "bg-green-500", badge: "bg-green-100 text-green-700", icon: "🟢" },
};

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("dismissed_announcements") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${BASE}/api/admin/announcements`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const visible = announcements.filter(a => !dismissed.includes(a._id));
  if (visible.length === 0) return null;

  const dismiss = (id) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    localStorage.setItem("dismissed_announcements", JSON.stringify(updated));
  };

  return (
    <div className="max-w-[1300px] mx-auto mb-6 space-y-2">
      {visible.map(ann => {
        const style = PRIORITY_STYLES[ann.priority] || PRIORITY_STYLES.Medium;
        return (
          <div key={ann._id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex items-stretch">
            <div className={`w-1 flex-shrink-0 ${style.bar}`} />
            <div className="flex-1 px-4 py-3 flex items-center gap-3">
              {ann.isPinned && <span className="text-yellow-500 text-sm flex-shrink-0">📌</span>}
              <span className="text-sm flex-shrink-0">{style.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-gray-800 text-sm">{ann.title}: </span>
                <span className="text-gray-600 text-sm">{ann.description}</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${style.badge}`}>
                {ann.priority}
              </span>
              <button onClick={() => dismiss(ann._id)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2 text-lg leading-none">×</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

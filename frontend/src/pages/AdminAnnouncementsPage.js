import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" };
}

const PRIORITY_STYLES = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const EMPTY_FORM = { title: "", description: "", priority: "Medium", isPinned: false, expiresAt: "" };

export default function AdminAnnouncementsPage() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/announcements`, { headers: authHeaders() });
      if (res.ok) setAnnouncements(await res.json());
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const openCreate = () => { setEditTarget(null); setFormData(EMPTY_FORM); setFormError(""); setShowForm(true); };
  const openEdit = (ann) => {
    setEditTarget(ann);
    setFormData({
      title: ann.title, description: ann.description, priority: ann.priority,
      isPinned: ann.isPinned, expiresAt: ann.expiresAt ? ann.expiresAt.split("T")[0] : "",
    });
    setFormError(""); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const url = editTarget
        ? `${BASE}/api/admin/announcements/${editTarget._id}`
        : `${BASE}/api/admin/announcements`;
      const method = editTarget ? "PATCH" : "POST";
      const payload = { ...formData, expiresAt: formData.expiresAt || null };
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setFormError(data.message); return; }
      setShowForm(false);
      fetchAnnouncements();
    } catch { setFormError("Something went wrong."); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete announcement "${title}"?`)) return;
    try {
      const res = await fetch(`${BASE}/api/admin/announcements/${id}`, { method: "DELETE", headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      fetchAnnouncements();
    } catch { alert("Failed to delete."); }
  };

  const handleTogglePin = async (ann) => {
    try {
      const res = await fetch(`${BASE}/api/admin/announcements/${ann._id}`, {
        method: "PATCH", headers: authHeaders(),
        body: JSON.stringify({ isPinned: !ann.isPinned }),
      });
      if (res.ok) fetchAnnouncements();
    } catch { }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6 pt-20">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => navigate("/admin")} className="text-sm text-gray-500 hover:text-gray-800 mb-1">← Back to Dashboard</button>
            <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
            <p className="text-sm text-gray-500 mt-1">Visible to all users across all dashboards</p>
          </div>
          <button onClick={openCreate} className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition">
            + New Announcement
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <span className="text-5xl">📢</span>
            <p className="text-gray-500 mt-3">No announcements yet.</p>
            <button onClick={openCreate} className="mt-3 text-sm text-black font-medium hover:underline">Post your first announcement →</button>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(ann => (
              <div key={ann._id}
                className={`bg-white rounded-2xl shadow border p-5 transition-all ${ann.isPinned ? "border-yellow-300" : "border-gray-200"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {ann.isPinned && <span className="text-yellow-500 text-sm">📌</span>}
                      <h3 className="font-semibold text-gray-800 text-base">{ann.title}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[ann.priority] || ""}`}>{ann.priority}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{ann.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                      <span>By {ann.createdBy?.name || "Admin"}</span>
                      <span>•</span>
                      <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                      {ann.expiresAt && (
                        <>
                          <span>•</span>
                          <span>Expires {new Date(ann.expiresAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleTogglePin(ann)}
                      title={ann.isPinned ? "Unpin" : "Pin"}
                      className={`text-sm px-2 py-1 rounded hover:bg-yellow-50 transition ${ann.isPinned ? "text-yellow-600" : "text-gray-400"}`}>
                      📌
                    </button>
                    <button onClick={() => openEdit(ann)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition">Edit</button>
                    <button onClick={() => handleDelete(ann._id, ann.title)}
                      className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-1">{editTarget ? "Edit Announcement" : "New Announcement"}</h2>
              <p className="text-sm text-gray-500 mb-5">This will be visible across all user dashboards.</p>

              {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{formError}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Title *" value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })} required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm" />

                <textarea placeholder="Description *" value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })} required rows={4}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm resize-none" />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm">
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expires On (optional)</label>
                    <input type="date" value={formData.expiresAt}
                      onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm" />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div onClick={() => setFormData({ ...formData, isPinned: !formData.isPinned })}
                    className={`w-10 h-5 rounded-full transition-colors ${formData.isPinned ? "bg-black" : "bg-gray-300"} relative`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${formData.isPinned ? "left-5" : "left-0.5"}`} />
                  </div>
                  <span className="text-sm text-gray-700">Pin this announcement (shows at top)</span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={formLoading}
                    className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 transition">
                    {formLoading ? "Saving..." : editTarget ? "Save Changes" : "Post Announcement"}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setFormError(""); }}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

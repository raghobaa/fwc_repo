import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" };
}

const EMPTY_FORM = { name: "", description: "", head: "" };

export default function AdminDepartmentsPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [hrUsers, setHrUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/departments`, { headers: authHeaders() });
      if (res.ok) setDepartments(await res.json());
    } catch { } finally { setLoading(false); }
  }, []);

  const fetchHRUsers = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/admin/users`, { headers: authHeaders() });
      if (res.ok) {
        const all = await res.json();
        setHrUsers(all.filter(u => u.role === "HR"));
      }
    } catch { }
  }, []);

  useEffect(() => { fetchDepartments(); fetchHRUsers(); }, [fetchDepartments, fetchHRUsers]);

  const openCreate = () => { setEditTarget(null); setFormData(EMPTY_FORM); setFormError(""); setShowForm(true); };
  const openEdit = (dept) => {
    setEditTarget(dept);
    setFormData({ name: dept.name, description: dept.description || "", head: dept.head?._id || "" });
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const url = editTarget
        ? `${BASE}/api/admin/departments/${editTarget._id}`
        : `${BASE}/api/admin/departments`;
      const method = editTarget ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok) { setFormError(data.message); return; }
      setShowForm(false);
      fetchDepartments();
    } catch { setFormError("Something went wrong. Please try again."); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete department "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${BASE}/api/admin/departments/${id}`, { method: "DELETE", headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      fetchDepartments();
    } catch { alert("Failed to delete department."); }
  };

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.head?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-100 min-h-screen p-6 pt-20">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => navigate("/admin")} className="text-sm text-gray-500 hover:text-gray-800 mb-1">← Back to Dashboard</button>
            <h1 className="text-2xl font-bold text-gray-800">Department Management</h1>
            <p className="text-sm text-gray-500 mt-1">{departments.length} department{departments.length !== 1 ? "s" : ""} total</p>
          </div>
          <button onClick={openCreate} className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition">
            + Add Department
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input type="text" placeholder="Search by department name or head..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading departments...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-4xl">🏢</span>
              <p className="text-gray-500 mt-3">No departments found.</p>
              <button onClick={openCreate} className="mt-3 text-sm text-black font-medium hover:underline">Create your first department →</button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Department</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Description</th>
                  <th className="text-left p-4 font-semibold text-gray-600">HR Head</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Employees</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Created</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(dept => (
                  <tr key={dept._id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4 font-semibold text-gray-800">{dept.name}</td>
                    <td className="p-4 text-gray-500 max-w-xs truncate">{dept.description || "—"}</td>
                    <td className="p-4">
                      {dept.head ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          🧑‍💼 {dept.head.name}
                        </span>
                      ) : <span className="text-gray-400 text-xs">Not assigned</span>}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        👥 {dept.employeeCount || 0}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{new Date(dept.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(dept)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition">Edit</button>
                        <button onClick={() => handleDelete(dept._id, dept.name)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 mb-1">{editTarget ? "Edit Department" : "Add Department"}</h2>
              <p className="text-sm text-gray-500 mb-5">{editTarget ? `Editing "${editTarget.name}"` : "Create a new department and assign an HR head."}</p>

              {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{formError}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Department Name *" value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })} required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm" />
                <textarea placeholder="Description (optional)" value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm resize-none" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HR Head (optional)</label>
                  <select value={formData.head} onChange={e => setFormData({ ...formData, head: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm">
                    <option value="">Not assigned</option>
                    {hrUsers.map(hr => <option key={hr._id} value={hr._id}>{hr.name} ({hr.email})</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={formLoading}
                    className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 transition">
                    {formLoading ? "Saving..." : editTarget ? "Save Changes" : "Create Department"}
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

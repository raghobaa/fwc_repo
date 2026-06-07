import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return "Yesterday";
  return new Date(dateStr).toLocaleDateString();
}

const ACTIVITY_ICONS = {
  USER_CREATED: "👤",
  USER_DELETED: "🗑️",
  USER_ROLE_CHANGED: "🔄",
  JOB_CREATED: "💼",
  LEAVE_APPROVED: "✅",
  LEAVE_REJECTED: "❌",
  ANNOUNCEMENT_CREATED: "📢",
  ANNOUNCEMENT_DELETED: "🗑️",
  DEPARTMENT_CREATED: "🏢",
  DEPARTMENT_UPDATED: "✏️",
  DEPARTMENT_DELETED: "🗑️",
  EMPLOYEE_CREATED: "👥",
  PAYROLL_GENERATED: "💰",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/admin/stats`, { headers: authHeaders() });
      if (res.ok) setStats(await res.json());
    } catch { } finally { setLoadingStats(false); }
  }, []);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/admin/activity`, { headers: authHeaders() });
      if (res.ok) setActivity(await res.json());
    } catch { } finally { setLoadingActivity(false); }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchActivity();
  }, [fetchStats, fetchActivity]);

  /* ── Feature 1: Stat cards ────────────────────────────────────────────────── */
  const statCards = [
    { label: "Total Employees", value: stats?.employees, icon: "👥", color: "bg-blue-50 text-blue-700", border: "border-blue-200", onClick: () => navigate("/admin/users", { state: { roleFilter: "Employee" } }) },
    { label: "HR Users", value: stats?.hrUsers, icon: "🧑‍💼", color: "bg-purple-50 text-purple-700", border: "border-purple-200", onClick: () => navigate("/admin/users", { state: { roleFilter: "HR" } }) },
    { label: "Active Candidates", value: stats?.candidates, icon: "🎯", color: "bg-yellow-50 text-yellow-700", border: "border-yellow-200", onClick: () => navigate("/admin/users", { state: { roleFilter: "Candidate" } }) },
    { label: "Open Job Positions", value: stats?.openJobs, icon: "💼", color: "bg-green-50 text-green-700", border: "border-green-200", onClick: () => navigate("/hr/applications") },
    { label: "Departments", value: stats?.departments, icon: "🏢", color: "bg-red-50 text-red-700", border: "border-red-200", onClick: () => navigate("/admin/departments") },
  ];

  /* ── Feature cards (navigation) ──────────────────────────────────────────── */
  const navCards = [
    { title: "User Management", description: "Create and manage Admin, HR, Employee and Candidate accounts. Assign roles.", action: () => navigate("/admin/users"), badge: "Core", badgeColor: "bg-red-100 text-red-700" },
    { title: "Departments", description: "Create departments, assign HR heads, and track team structure.", action: () => navigate("/admin/departments"), badge: "Structure", badgeColor: "bg-purple-100 text-purple-700" },
    { title: "Announcements", description: "Post company-wide notices visible to all employees and candidates.", action: () => navigate("/admin/announcements"), badge: "Comms", badgeColor: "bg-blue-100 text-blue-700" },
    { title: "Role & Permissions", description: "View the read-only permission matrix showing what each role can access.", action: () => navigate("/admin/permissions"), badge: "Security", badgeColor: "bg-green-100 text-green-700" },
    { title: "HR Dashboard", description: "Access all HR tools — attendance, leave requests, payroll, onboarding, and interviews.", action: () => navigate("/hr"), badge: "HR Tools", badgeColor: "bg-indigo-100 text-indigo-700" },
    { title: "Recruitment", description: "View job postings, review candidate applications, and manage resume screening.", action: () => navigate("/hr/applications"), badge: "Hiring", badgeColor: "bg-orange-100 text-orange-700" },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-6 pt-20 text-gray-800">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user.name || "Admin"}</p>
        </div>

        {/* ── Feature 1: Stats Row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((card, i) => (
            <div key={i} onClick={card.onClick}
              className={`bg-white rounded-xl shadow border ${card.border} p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${card.color} text-xl mb-3`}>
                {card.icon}
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {loadingStats ? <span className="inline-block w-8 h-6 bg-gray-200 rounded animate-pulse" /> : (stats ? card.value : "—")}
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{card.label}</p>
            </div>
          ))}
        </div>

        {/* ── Main grid: Nav cards + Activity ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Nav cards: 2/3 width */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {navCards.map((card, i) => (
              <div key={i} onClick={card.action}
                className="cursor-pointer bg-white rounded-2xl shadow border border-gray-200 p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900">{card.title}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${card.badgeColor}`}>{card.badge}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-snug">{card.description}</p>
                </div>
                <div className="mt-4 text-sm font-medium text-gray-800">Open →</div>
              </div>
            ))}
          </div>

          {/* Feature 2: Activity Feed: 1/3 width */}
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
              <span className="text-xs text-gray-400">Last 20 actions</span>
            </div>

            {loadingActivity ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-2 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <span className="text-3xl mb-2">📋</span>
                <p className="text-sm text-gray-500">No activity yet.</p>
                <p className="text-xs text-gray-400 mt-1">Actions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto flex-1 pr-1" style={{ maxHeight: "420px" }}>
                {activity.map((log) => (
                  <div key={log._id} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">
                      {ACTIVITY_ICONS[log.activityType] || "📌"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-snug line-clamp-2">{log.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{timeAgo(log.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

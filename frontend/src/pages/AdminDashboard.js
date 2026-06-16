import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, Megaphone, ShieldCheck, Briefcase,
  ClipboardList, Bell, Search, Menu, X, LogOut, Camera, Zap, ChevronRight,
  UserPlus, Trash2, RefreshCw, CheckCircle, XCircle, Edit, DollarSign,
  Target, UserCheck, Pin
} from 'lucide-react';

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
  USER_CREATED:        <UserPlus   className="h-4 w-4 text-blue-500"   />,
  USER_DELETED:        <Trash2     className="h-4 w-4 text-red-500"    />,
  USER_ROLE_CHANGED:   <RefreshCw  className="h-4 w-4 text-purple-500" />,
  JOB_CREATED:         <Briefcase  className="h-4 w-4 text-green-500"  />,
  LEAVE_APPROVED:      <CheckCircle className="h-4 w-4 text-green-500" />,
  LEAVE_REJECTED:      <XCircle    className="h-4 w-4 text-red-500"    />,
  ANNOUNCEMENT_CREATED:<Megaphone  className="h-4 w-4 text-blue-500"   />,
  ANNOUNCEMENT_DELETED:<Trash2     className="h-4 w-4 text-red-500"    />,
  DEPARTMENT_CREATED:  <Building2  className="h-4 w-4 text-indigo-500" />,
  DEPARTMENT_UPDATED:  <Edit       className="h-4 w-4 text-yellow-500" />,
  DEPARTMENT_DELETED:  <Trash2     className="h-4 w-4 text-red-500"    />,
  EMPLOYEE_CREATED:    <Users      className="h-4 w-4 text-blue-500"   />,
  PAYROLL_GENERATED:   <DollarSign className="h-4 w-4 text-green-500"  />,
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  /* ── Sidebar navigation ───────────────────────────────────────────────── */
  const menuItems = [
    { name: "Dashboard",        icon: <LayoutDashboard className="h-5 w-5" />, path: "/admin" },
    { name: "User Management",  icon: <Users           className="h-5 w-5" />, path: "/admin/users" },
    { name: "Departments",      icon: <Building2       className="h-5 w-5" />, path: "/admin/departments" },
    { name: "Announcements",    icon: <Megaphone       className="h-5 w-5" />, path: "/admin/announcements" },
    { name: "Role & Permissions", icon: <ShieldCheck   className="h-5 w-5" />, path: "/admin/permissions" },
    { name: "HR Dashboard",     icon: <Briefcase       className="h-5 w-5" />, path: "/hr" },
    { name: "Recruitment",      icon: <ClipboardList   className="h-5 w-5" />, path: "/hr/applications" },
  ];

  /* ── Stat cards ───────────────────────────────────────────────────────── */
  const statCards = [
    { label: "Total Employees",    value: stats?.employees,  icon: <Users       className="h-8 w-8 text-blue-200" />, badge: "Staff",      onClick: () => navigate("/admin/users", { state: { roleFilter: "Employee" } }) },
    { label: "HR Users",           value: stats?.hrUsers,    icon: <UserCheck   className="h-8 w-8 text-blue-200" />, badge: "HR",         onClick: () => navigate("/admin/users", { state: { roleFilter: "HR" } }) },
    { label: "Active Candidates",  value: stats?.candidates, icon: <Target      className="h-8 w-8 text-blue-200" />, badge: "Candidates", onClick: () => navigate("/admin/users", { state: { roleFilter: "Candidate" } }) },
    { label: "Open Job Positions", value: stats?.openJobs,   icon: <Briefcase   className="h-8 w-8 text-blue-200" />, badge: "Open",       onClick: () => navigate("/hr/applications") },
    { label: "Departments",        value: stats?.departments, icon: <Building2  className="h-8 w-8 text-blue-200" />, badge: "Teams",      onClick: () => navigate("/admin/departments") },
  ];

  /* ── Quick access cards ───────────────────────────────────────────────── */
  const navCards = [
    { title: "User Management",  description: "Create and manage Admin, HR, Employee and Candidate accounts. Assign roles.",             action: () => navigate("/admin/users"),        badge: "Core",      badgeColor: "bg-red-100 text-red-700",     icon: <Users       className="h-8 w-8" /> },
    { title: "Departments",      description: "Create departments, assign HR heads, and track team structure.",                          action: () => navigate("/admin/departments"),  badge: "Structure", badgeColor: "bg-purple-100 text-purple-700", icon: <Building2   className="h-8 w-8" /> },
    { title: "Announcements",    description: "Post company-wide notices visible to all employees and candidates.",                      action: () => navigate("/admin/announcements"),badge: "Comms",     badgeColor: "bg-blue-100 text-blue-700",    icon: <Megaphone   className="h-8 w-8" /> },
    { title: "Role & Permissions",description: "View the read-only permission matrix showing what each role can access.",               action: () => navigate("/admin/permissions"),  badge: "Security",  badgeColor: "bg-green-100 text-green-700",  icon: <ShieldCheck className="h-8 w-8" /> },
    { title: "HR Dashboard",     description: "Access all HR tools — attendance, leave requests, payroll, onboarding, and interviews.", action: () => navigate("/hr"),                 badge: "HR Tools",  badgeColor: "bg-indigo-100 text-indigo-700", icon: <Briefcase   className="h-8 w-8" /> },
    { title: "Recruitment",      description: "View job postings, review candidate applications, and manage resume screening.",         action: () => navigate("/hr/applications"),    badge: "Hiring",    badgeColor: "bg-orange-100 text-orange-700", icon: <ClipboardList className="h-8 w-8" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 fixed h-full z-20 overflow-y-auto`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0">
              <Zap className="h-6 w-6 text-white" />
            </div>
            {sidebarOpen && <span className="text-lg font-bold text-gray-900 whitespace-nowrap">HRMS</span>}
          </div>

          {/* Admin Profile Card */}
          <div className="flex items-center gap-3 mb-8 p-3 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition group">
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-sm font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                <Camera className="h-3 w-3 text-blue-500" />
              </div>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "Admin"}</p>
                <p className="text-xs text-gray-500 truncate">Administrator</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 transition-all duration-200"
              >
                <span className="flex-shrink-0 text-gray-500">{item.icon}</span>
                {sidebarOpen && <span className="text-sm font-medium truncate">{item.name}</span>}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 transition">
              <LogOut className="h-5 w-5 text-gray-500 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-72' : 'ml-20'} flex-1 transition-all duration-300`}>
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition">
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Search className="h-5 w-5 text-gray-500" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                </div>
                {sidebarOpen && (
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-gray-900">{user?.name || "Admin"}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="px-8 py-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="bg-white/20 backdrop-blur px-4 py-1.5 rounded-full">
                <span className="text-sm font-bold tracking-wide">ADMIN DASHBOARD</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!</h1>
            <p className="text-blue-100">Oversee users, departments, announcements, and the entire HRMS platform</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
              {statCards.map((card, i) => (
                <div
                  key={i}
                  onClick={card.onClick}
                  className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20 cursor-pointer hover:bg-white/20 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    {card.icon}
                    <span className="text-xs text-blue-200 bg-white/20 px-2 py-1 rounded-full">{card.badge}</span>
                  </div>
                  <p className="text-3xl font-bold mt-2">
                    {loadingStats ? <span className="inline-block w-10 h-7 bg-white/20 rounded animate-pulse" /> : (stats ? card.value : "—")}
                  </p>
                  <p className="text-sm text-blue-100 mt-1">{card.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">Quick Access</h2>
            </div>
            <span className="text-xs text-gray-500">Admin Tools</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {navCards.map((card, i) => (
              <div
                key={i}
                onClick={card.action}
                className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                      {card.icon}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${card.badgeColor}`}>{card.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">{card.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{card.description}</p>
                  <div className="flex justify-end">
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="px-8 pb-8">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
              <span className="text-xs text-gray-500">Last 20 actions</span>
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
              <div className="flex flex-col items-center justify-center text-center py-8">
                <ClipboardList className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No activity yet.</p>
                <p className="text-xs text-gray-400 mt-1">Actions will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 overflow-y-auto" style={{ maxHeight: "420px" }}>
                {activity.map((log) => (
                  <div key={log._id} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {ACTIVITY_ICONS[log.activityType] || <Pin className="h-4 w-4 text-gray-400" />}
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

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">Need help? Our support team is here to help you succeed</p>
          <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">Contact Support →</button>
        </div>
      </div>
    </div>
  );
}

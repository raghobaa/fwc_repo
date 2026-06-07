import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FolderGit2, Fingerprint, DollarSign, Calendar,
  MessageSquare, FileText, CheckCircle, Gift, Brain, BarChart3,
  Sparkles, Settings, LogOut, Menu, X, User, Mail, Phone, MapPin,
  Briefcase, Code, Award, Bell, Search, ChevronRight, Users,
  Clock, TrendingUp, Target, Zap, Crown, Camera, Edit2, Trash2,
  Plus, Building, Video, BarChart as BarChartIcon
} from 'lucide-react';
import AnnouncementBanner from "../components/AnnouncementBanner";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    ongoingProjects: 0,
    pendingTasks: 0,
    attendancePercentage: 0,
    leaveBalance: 0
  });

  const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

  // Navigation menu (same style as candidate dashboard)
  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, path: "/employee" },
    { name: "Projects", icon: <FolderGit2 className="h-5 w-5" />, path: "/employee/projects" },
    { name: "Attendance", icon: <Fingerprint className="h-5 w-5" />, path: "/employee/attendance" },
    { name: "Payroll", icon: <DollarSign className="h-5 w-5" />, path: "/employee/payroll" },
    { name: "Leave Requests", icon: <Calendar className="h-5 w-5" />, path: "/employee/leave" },
    
   
    { name: "Tasks", icon: <CheckCircle className="h-5 w-5" />, path: "/employee/tasks" },
    
    { name: "AI Idea Hub", icon: <Gift className="h-5 w-5" />, path: "/employee/ai-ideas" },
    { name: "AI Work Assistant", icon: <Brain className="h-5 w-5" />, path: "/employee/ai-assistant" },
    { name: "Promotion Tracker", icon: <BarChart3 className="h-5 w-5" />, path: "/employee/promotion" },
   { name: "Feedback", icon: <MessageSquare className="h-5 w-5" />, path: "/employee/feedback" },
  ];

  // Feature cards (displayed in grid)
  const features = [
    { title: "Projects", description: "Access and track your assigned projects. Stay updated with deadlines and progress.", icon: <FolderGit2 className="h-8 w-8" />, path: "/employee/projects" },
    { title: "Attendance", description: "Check your attendance records and mark your daily attendance seamlessly.", icon: <Fingerprint className="h-8 w-8" />, path: "/employee/attendance" },
    { title: "Payroll", description: "View and download your latest payslips, allowances, and deductions.", icon: <DollarSign className="h-8 w-8" />, path: "/employee/payroll" },
    { title: "Leave Requests", description: "Submit new leave requests or track the status of your previous requests.", icon: <Calendar className="h-8 w-8" />, path: "/employee/leave" },
    { title: "Feedback", description: "Share your feedback directly with HR — completely secure and confidential.", icon: <MessageSquare className="h-8 w-8" />, path: "/employee/feedback" },
   
    { title: "Tasks", description: "Manage your daily tasks and track completion status.", icon: <CheckCircle className="h-8 w-8" />, path: "/employee/tasks" },
    { title: "AI Idea Hub", description: "Submit and evaluate innovative ideas with AI scoring.", icon: <Gift className="h-8 w-8" />, path: "/employee/ai-ideas" },
    { title: "AI Work Assistant", description: "Smart task prioritization and daily work planner.", icon: <Brain className="h-8 w-8" />, path: "/employee/ai-assistant" },
    { title: "Promotion Tracker", description: "Check your promotion eligibility and track progress.", icon: <BarChart3 className="h-8 w-8" />, path: "/employee/promotion" },
  ];

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      // Fetch profile
      const profileRes = await fetch(`${BASE_URL}/api/employee/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data);
      } else {
        // Demo fallback (remove in production)
        setProfile({
          name: "John Doe",
          email: "john@example.com",
          phone: "+91 9876543210",
          designation: "Software Engineer",
          department: "Engineering",
          location: "Bangalore",
          experienceYears: 3,
          skills: ["React", "Node.js", "Python"],
          certifications: ["AWS Certified"],
          avatar: ""
        });
      }

      // Fetch stats
      const statsRes = await fetch(`${BASE_URL}/api/employee/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      } else {
        setStats({ ongoingProjects: 0, pendingTasks: 0, attendancePercentage: 0, leaveBalance: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - same style as candidate dashboard */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 fixed h-full z-20 overflow-y-auto`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0">
              <Zap className="h-6 w-6 text-white" />
            </div>
            {sidebarOpen && <span className="text-lg font-bold text-gray-900 whitespace-nowrap">HRMS</span>}
          </div>

          {/* Employee Profile Card */}
          <div className="flex items-center gap-3 mb-8 p-3 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition group">
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-sm font-bold">{profile?.name?.charAt(0)?.toUpperCase() || 'E'}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                <Camera className="h-3 w-3 text-blue-500" />
              </div>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{profile?.name || "Employee"}</p>
                <p className="text-xs text-gray-500 truncate">{profile?.designation || "Software Engineer"}</p>
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
                  <span className="text-white text-sm font-bold">{profile?.name?.charAt(0)?.toUpperCase() || 'E'}</span>
                </div>
                {sidebarOpen && (
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-gray-900">{profile?.name || "Employee"}</p>
                    <p className="text-xs text-gray-500">{profile?.email}</p>
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
                <span className="text-sm font-bold tracking-wide">EMPLOYEE DASHBOARD</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {profile?.name?.split(' ')[0] || 'Employee'}! 👋</h1>
            <p className="text-blue-100">Track your work, projects, and career growth</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <FolderGit2 className="h-8 w-8 text-blue-200" />
                  <span className="text-xs text-blue-200 bg-white/20 px-2 py-1 rounded-full">Active</span>
                </div>
                <p className="text-3xl font-bold mt-2">{stats.ongoingProjects}</p>
                <p className="text-sm text-blue-100 mt-1">Ongoing Projects</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-8 w-8 text-blue-200" />
                  <span className="text-xs text-blue-200 bg-white/20 px-2 py-1 rounded-full">Pending</span>
                </div>
                <p className="text-3xl font-bold mt-2">{stats.pendingProjects}</p>
                <p className="text-sm text-blue-100 mt-1">Pending Projects</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <Fingerprint className="h-8 w-8 text-blue-200" />
                  <span className="text-xs text-blue-200 bg-white/20 px-2 py-1 rounded-full">This Month</span>
                </div>
                <p className="text-3xl font-bold mt-2">{stats.attendancePercentage}%</p>
                <p className="text-sm text-blue-100 mt-1">Today's Attendance Status</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="h-8 w-8 text-blue-200" />
                  <span className="text-xs text-blue-200 bg-white/20 px-2 py-1 rounded-full">Available</span>
                </div>
                <p className="text-3xl font-bold mt-2">{stats.leaveBalance}</p>
                <p className="text-sm text-blue-100 mt-1">Employees on Leave</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">Quick Access</h2>
            </div>
            <span className="text-xs text-gray-500">Employee Tools</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                onClick={() => navigate(feature.path)}
                className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                <div className="p-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-md group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">{feature.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{feature.description}</p>
                  <div className="flex justify-end">
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition" />
                  </div>
                </div>
              </div>
            ))}
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
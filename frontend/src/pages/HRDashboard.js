import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { createJob } from "../api/api";
import AnnouncementBanner from "../components/AnnouncementBanner";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
} from "recharts";
import {
  LayoutDashboard, Users, Building2, Megaphone, ShieldCheck, ClipboardList,
  Bell, Search, Menu, X, LogOut, Camera, Zap, ChevronRight,
  UserPlus, Trash2, RefreshCw, CheckCircle, XCircle, Edit, DollarSign,
  Target, UserCheck, Briefcase,
} from 'lucide-react';

/* ─── Chatbot message renderer ─────────────────────────────────────────────── */
function BotMessageCard({ text }) {
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  return (
    <div className="bot-card">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("## ")) {
          return (
            <p key={i} className="bot-heading">
              {trimmed.replace(/^##\s*/, "")}
            </p>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={i} className="bot-list-item">
              <span className="bot-list-num">{trimmed.match(/^(\d+)\./)[1]}</span>
              <span>{renderBold(trimmed.replace(/^\d+\.\s*/, ""))}</span>
            </div>
          );
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          return (
            <div key={i} className="bot-bullet-item">
              <span className="bot-bullet">●</span>
              <span>{renderBold(trimmed.replace(/^[-•]\s*/, ""))}</span>
            </div>
          );
        }
        return (
          <p key={i} className="bot-text">
            {renderBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function renderBold(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

/* ─── Main HR Dashboard ─────────────────────────────────────────────────────── */
export default function HRDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hello! I'm your **HR Assistant**. Ask me anything about employees, attendance, leave, payroll, projects, or job applications.",
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [jobData, setJobData] = useState({ title: "", description: "", location: "" });
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveCount, setLeaveCount] = useState(0);
  const [payrollSummary, setPayrollSummary] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const messagesEndRef = useRef(null);

  /* ── Dashboard data fetch ────────────────────────────────────────────────── */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

        const [attendanceRes, leaveRes, payrollRes, projectRes] = await Promise.all([
          fetch(`${BASE}/api/hr/attendance`, { headers }),
          fetch(`${BASE}/api/hr/leave`, { headers }),
          fetch(`${BASE}/api/hr/payroll`, { headers }),
          fetch(`${BASE}/api/projects`, { headers }),
        ]);

        const [attendanceData, leaveData, payrollData, projectsData] = await Promise.all([
          attendanceRes.json(),
          leaveRes.json(),
          payrollRes.json(),
          projectRes.json(),
        ]);

        setAttendanceData(attendanceData || []);
        const pending = leaveData?.filter((l) => l.status === "Pending") || [];
        setLeaveCount(pending.length);

        if (Array.isArray(payrollData)) {
          const summary = payrollData.reduce(
            (acc, p) => {
              acc.base += p.baseSalary || 0;
              acc.allowance += p.bonus || 0;
              acc.deduction += p.deductions || 0;
              return acc;
            },
            { base: 0, allowance: 0, deduction: 0 }
          );
          setPayrollSummary([
            { name: "Salaries", value: summary.base },
            { name: "Bonuses", value: summary.allowance },
            { name: "Deductions", value: summary.deduction },
          ]);
        }

        const active = projectsData?.find((p) => p.status === "Active");
        setActiveProject(active || null);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, []);

  /* ── Auto scroll to latest message ──────────────────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ── Attendance chart data ───────────────────────────────────────────────── */
  const presentCount = attendanceData.length;
  const attendanceChart = [
    { name: "Present", value: presentCount },
    { name: "Remaining", value: Math.max(0, 100 - presentCount) },
  ];
  const COLORS = ["#1E3A8A", "#E5E7EB"];

  /* ── Job submit ──────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createJob(jobData);
      alert("✅ Job added successfully!");
      setShowModal(false);
      setJobData({ title: "", description: "", location: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to add job");
    }
  };

  /* ── Send message to chatbot ─────────────────────────────────────────────── */
  const CHATBOT_URL = process.env.REACT_APP_CHATBOT_URL || "http://localhost:5011";

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userMsg = inputMsg.trim();
    if (!userMsg) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setMessages((prev) => [...prev,
        { sender: "user", text: userMsg },
        { sender: "bot", text: "⚠️ You are not logged in. Please log in again." },
      ]);
      setInputMsg("");
      return;
    }

    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInputMsg("");
    setIsTyping(true);

    try {
      const res = await axios.post(
        `${CHATBOT_URL}/api/hr/chatbot/message`,
        { message: userMsg },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
      setMessages((prev) => [...prev, { sender: "bot", text: res.data.response }]);
    } catch (err) {
      console.error("Chatbot error:", err);
      let errorMsg = "⚠️ Could not reach the HR chatbot server.";
      if (err.code === "ECONNREFUSED" || err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMsg = "⚠️ **Server not reachable.** Make sure both servers are running:\n- `cd backend && npm run chatbot` (port 5011)\n- `cd ai-services/hrbot && python3.11 app.py` (port 6000)";
      } else if (err.response?.status === 401) {
        errorMsg = "⚠️ **Session expired.** Please log in again.";
      } else if (err.response?.status === 403) {
        errorMsg = "⚠️ **Access denied.** This chatbot is for HR users only.";
      } else if (err.response?.status === 500) {
        errorMsg = `⚠️ **AI service error:** ${err.response?.data?.error || "Please try again."}`;
      } else if (err.code === "ECONNABORTED") {
        errorMsg = "⚠️ **Request timed out.** The AI is taking too long. Please try again.";
      }
      setMessages((prev) => [...prev, { sender: "bot", text: errorMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  /* ── Sidebar navigation ───────────────────────────────────────────────── */
  const menuItems = [
    { name: "Dashboard",        icon: <LayoutDashboard className="h-5 w-5" />, path: "/hr" },
    { name: "Employee Mgmt",    icon: <Users           className="h-5 w-5" />, path: "/hr/employee-management" },
    { name: "Attendance",       icon: <ClipboardList   className="h-5 w-5" />, path: "/hr/attendance" },
    { name: "Leave Requests",   icon: <Megaphone       className="h-5 w-5" />, path: "/hr/leave" },
    { name: "Payroll",          icon: <DollarSign      className="h-5 w-5" />, path: "/hr/payroll" },
    { name: "Projects",         icon: <Briefcase       className="h-5 w-5" />, path: "/hr/projects" },
    { name: "Onboarding",       icon: <UserPlus        className="h-5 w-5" />, path: "/hr/onboarding" },
    { name: "Interviews",       icon: <Target          className="h-5 w-5" />, path: "/hr/interviews" },
    { name: "Applications",     icon: <ClipboardList   className="h-5 w-5" />, path: "/hr/applications" },
    { name: "Feedback",         icon: <Edit            className="h-5 w-5" />, path: "/hr/feedback" },
    { name: "Talent Heatmap",   icon: <Target          className="h-5 w-5" />, path: "/hr/talent-heatmap" },
  ];

  /* ── Stat cards ───────────────────────────────────────────────────────── */
  const statCards = [
    { label: "Employees",       value: "—",  icon: <Users       className="h-8 w-8 text-blue-200" />, badge: "Team",   onClick: () => navigate("/hr/employee-management") },
    { label: "Pending Leaves",  value: leaveCount, icon: <Megaphone   className="h-8 w-8 text-blue-200" />, badge: "Leave",  onClick: () => navigate("/hr/leave") },
    { label: "Attendance Today",value: `${presentCount}%`, icon: <ClipboardList className="h-8 w-8 text-blue-200" />, badge: "Today",  onClick: () => navigate("/hr/attendance") },
    { label: "Active Projects", value: activeProject ? 1 : 0, icon: <Briefcase   className="h-8 w-8 text-blue-200" />, badge: "Active", onClick: () => navigate("/hr/projects") },
    { label: "Job Openings",    value: "—",  icon: <Target      className="h-8 w-8 text-blue-200" />, badge: "Hiring", onClick: () => setShowModal(true) },
  ];

  /* ── Suggested prompts ───────────────────────────────────────────────────── */
  const suggestions = [
    "How many employees are present today?",
    "List all pending leave requests",
    "Show payroll summary",
    "Which projects are active?",
  ];

  /* ── Feature cards ───────────────────────────────────────────────────────── */
  const features = [
    {
      title: "Jobs",
      description: "Post new job openings and track applicants throughout the hiring pipeline.",
      onClick: () => setShowModal(true),
      badge: "Hiring",
      badgeColor: "bg-blue-100 text-blue-700",
      icon: <Briefcase className="h-8 w-8" />,
    },
    {
      title: "Bulk Resume Screening",
      description: "Upload multiple resumes and let AI auto-screen and rank top candidates.",
      onClick: () => navigate("/hr/resume-screening"),
      badge: "AI",
      badgeColor: "bg-purple-100 text-purple-700",
      icon: <ClipboardList className="h-8 w-8" />,
    },
    {
      title: "HR Resume Chatbot",
      description: "Ask AI to find candidates from the uploaded resume library.",
      onClick: () => navigate("/hr/resume-screening?tab=chat"),
      badge: "AI",
      badgeColor: "bg-indigo-100 text-indigo-700",
      icon: <Target className="h-8 w-8" />,
    },
    {
      title: "Onboarding",
      description: "Manage candidate onboarding: start, track status, or withdraw when needed.",
      onClick: () => navigate("/hr/onboarding"),
      badge: "HR",
      badgeColor: "bg-green-100 text-green-700",
      icon: <UserPlus className="h-8 w-8" />,
    },
    {
      title: "Interviews",
      description: "Schedule and manage interviews, monitor slots, and track progress.",
      onClick: () => navigate("/hr/interviews"),
      badge: "HR",
      badgeColor: "bg-orange-100 text-orange-700",
      icon: <Target className="h-8 w-8" />,
    },
    {
      title: "View Applications",
      description: "Access candidate applications, view resumes, and streamline recruitment.",
      onClick: () => navigate("/hr/applications"),
      badge: "Hiring",
      badgeColor: "bg-cyan-100 text-cyan-700",
      icon: <ClipboardList className="h-8 w-8" />,
    },
    {
      title: "Employee Management",
      description: "View and manage employee profiles, roles, and departments.",
      onClick: () => navigate("/hr/employee-management"),
      badge: "Core",
      badgeColor: "bg-red-100 text-red-700",
      icon: <Users className="h-8 w-8" />,
    },
    {
      title: "AI Talent Heatmap",
      description: "See department-wise skill strength, gaps, and training recommendations.",
      onClick: () => navigate("/hr/talent-heatmap"),
      badge: "AI",
      badgeColor: "bg-pink-100 text-pink-700",
      icon: <Target className="h-8 w-8" />,
    },
    {
      title: "Feedback",
      description: "Collect, analyze and review employee feedback to enhance engagement.",
      onClick: () => navigate("/hr/feedback"),
      badge: "Engage",
      badgeColor: "bg-teal-100 text-teal-700",
      icon: <Edit className="h-8 w-8" />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      {/* ── Chatbot styles ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .hr-chat-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

        .hr-chat-window {
          background: #fff;
          border-radius: 20px;
          width: 100%;
          max-width: 680px;
          height: 85vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0,0,0,0.3);
          animation: slideUp 0.3s cubic-bezier(.16,1,.3,1);
        }
        @keyframes slideUp { from { transform: translateY(30px); opacity:0 } to { transform: translateY(0); opacity:1 } }

        .hr-chat-header {
          background: linear-gradient(135deg, #1E3A8A 0%, #3B5FBF 100%);
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .hr-chat-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .hr-chat-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .hr-chat-title { color: #fff; font-size: 17px; font-weight: 700; }
        .hr-chat-subtitle { color: rgba(255,255,255,0.75); font-size: 12px; margin-top: 2px; }
        .hr-chat-close {
          background: rgba(255,255,255,0.15);
          border: none;
          color: #fff;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .hr-chat-close:hover { background: rgba(255,255,255,0.3); }

        .hr-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #F8FAFC;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .hr-chat-messages::-webkit-scrollbar { width: 5px; }
        .hr-chat-messages::-webkit-scrollbar-track { background: transparent; }
        .hr-chat-messages::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }

        .msg-row { display: flex; gap: 10px; align-items: flex-start; }
        .msg-row.user { flex-direction: row-reverse; }

        .msg-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }
        .msg-avatar.bot { background: linear-gradient(135deg, #1E3A8A, #3B5FBF); color: #fff; }
        .msg-avatar.user { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: #fff; }

        .user-bubble {
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: #fff;
          padding: 10px 16px;
          border-radius: 18px 18px 4px 18px;
          max-width: 75%;
          font-size: 14px;
          line-height: 1.5;
          box-shadow: 0 2px 10px rgba(99,102,241,0.3);
        }

        .bot-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 4px 18px 18px 18px;
          padding: 14px 18px;
          max-width: 82%;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .bot-heading {
          font-size: 14px;
          font-weight: 700;
          color: #1E3A8A;
          margin: 4px 0 6px;
          padding-bottom: 6px;
          border-bottom: 2px solid #EEF2FF;
        }
        .bot-text {
          font-size: 13.5px;
          color: #374151;
          line-height: 1.6;
          margin: 0;
        }
        .bot-list-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-size: 13.5px;
          color: #374151;
          line-height: 1.5;
          padding: 3px 0;
        }
        .bot-list-num {
          background: linear-gradient(135deg, #1E3A8A, #3B5FBF);
          color: #fff;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .bot-bullet-item {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          font-size: 13.5px;
          color: #374151;
          line-height: 1.5;
          padding: 2px 0;
        }
        .bot-bullet {
          color: #6366F1;
          font-size: 8px;
          margin-top: 5px;
          flex-shrink: 0;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 12px 16px;
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 4px 18px 18px 18px;
          width: fit-content;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .typing-dot {
          width: 7px;
          height: 7px;
          background: #94A3B8;
          border-radius: 50%;
          animation: typingBounce 1.2s infinite ease-in-out;
        }
        .typing-dot:nth-child(1) { animation-delay: 0s; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0.7); background: #CBD5E1; }
          40% { transform: scale(1); background: #1E3A8A; }
        }

        .suggestions-bar {
          display: flex;
          gap: 8px;
          padding: 10px 20px;
          overflow-x: auto;
          background: #F8FAFC;
          border-top: 1px solid #E2E8F0;
          flex-shrink: 0;
        }
        .suggestions-bar::-webkit-scrollbar { display: none; }
        .suggestion-chip {
          background: #EEF2FF;
          color: #4338CA;
          border: 1px solid #C7D2FE;
          border-radius: 20px;
          padding: 5px 14px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .suggestion-chip:hover { background: #1E3A8A; color: #fff; border-color: #1E3A8A; }

        .hr-chat-input-area {
          padding: 14px 20px;
          background: #fff;
          border-top: 1px solid #E2E8F0;
          display: flex;
          gap: 10px;
          align-items: center;
          flex-shrink: 0;
        }
        .hr-chat-input {
          flex: 1;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          padding: 10px 16px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s;
          background: #F8FAFC;
        }
        .hr-chat-input:focus { border-color: #6366F1; background: #fff; }
        .hr-chat-send {
          background: linear-gradient(135deg, #1E3A8A, #3B5FBF);
          color: #fff;
          border: none;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: transform 0.15s, box-shadow 0.15s;
          flex-shrink: 0;
        }
        .hr-chat-send:hover { transform: scale(1.05); box-shadow: 0 4px 15px rgba(30,58,138,0.4); }
        .hr-chat-send:active { transform: scale(0.97); }

        .chatbot-trigger-card {
          background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
          border-radius: 16px;
          padding: 24px 28px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 18px;
          max-width: 1300px;
          box-shadow: 0 8px 30px rgba(30,58,138,0.25);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }
        .chatbot-trigger-card::before {
          content: '';
          position: absolute;
          top: -30px; right: -30px;
          width: 120px; height: 120px;
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
        }
        .chatbot-trigger-card::after {
          content: '';
          position: absolute;
          bottom: -20px; right: 60px;
          width: 80px; height: 80px;
          background: rgba(255,255,255,0.06);
          border-radius: 50%;
        }
        .chatbot-trigger-card:hover { transform: translateY(-3px); box-shadow: 0 14px 40px rgba(30,58,138,0.35); }
        .chatbot-trigger-icon {
          width: 54px; height: 54px;
          background: rgba(255,255,255,0.15);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          flex-shrink: 0;
          backdrop-filter: blur(6px);
        }
        .chatbot-trigger-text h3 { color: #fff; font-size: 18px; font-weight: 700; margin: 0 0 4px; }
        .chatbot-trigger-text p { color: rgba(255,255,255,0.8); font-size: 13px; margin: 0; }
        .chatbot-trigger-arrow {
          margin-left: auto;
          color: rgba(255,255,255,0.7);
          font-size: 22px;
          position: relative;
          z-index: 1;
        }

        .online-dot {
          width: 8px; height: 8px;
          background: #4ADE80;
          border-radius: 50%;
          animation: pulse 2s infinite;
          display: inline-block;
          margin-right: 5px;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>

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

            {/* HR Profile Card */}
            <div className="flex items-center gap-3 mb-8 p-3 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition group">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'H'}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                  <Camera className="h-3 w-3 text-blue-500" />
                </div>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "HR"}</p>
                  <p className="text-xs text-gray-500 truncate">Human Resources</p>
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
                    <span className="text-white text-sm font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'H'}</span>
                  </div>
                  {sidebarOpen && (
                    <div className="hidden lg:block">
                      <p className="text-sm font-semibold text-gray-900">{user?.name || "HR"}</p>
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
                  <span className="text-sm font-bold tracking-wide">HR DASHBOARD</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0] || 'HR'}!</h1>
              <p className="text-blue-100">Manage employees, attendance, leave, payroll, and more</p>

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
                    <p className="text-3xl font-bold mt-2">{card.value}</p>
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
              <span className="text-xs text-gray-500">HR Tools</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((card, i) => (
                <div
                  key={i}
                  onClick={card.onClick}
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

            {/* HR AI Chatbot Trigger Card */}
            <div className="mt-8 chatbot-trigger-card" onClick={() => setShowChat(true)} id="hr-chatbot-trigger">
              <div className="chatbot-trigger-icon">🤖</div>
              <div className="chatbot-trigger-text">
                <h3>HR AI Assistant</h3>
                <p><span className="online-dot" />Ask anything about employees, leave, payroll, projects & more</p>
              </div>
              <div className="chatbot-trigger-arrow">→</div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">Need help? Our support team is here to help you succeed</p>
            <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">Contact Support →</button>
          </div>
        </div>

        {/* ── Job Modal ──────────────────────────────────────────────────────── */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white text-black p-6 rounded-lg w-96">
              <h2 className="text-lg font-bold mb-4">Add Job</h2>
              <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Job Title" value={jobData.title}
                  onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                  className="w-full mb-3 p-2 border rounded" required />
                <textarea placeholder="Description" value={jobData.description}
                  onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                  className="w-full mb-3 p-2 border rounded" required />
                <input type="text" placeholder="Location" value={jobData.location}
                  onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                  className="w-full mb-3 p-2 border rounded" />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition shadow-sm">Cancel</button>
                  <button type="submit"
                    className="bg-[#1E3A8A] hover:bg-[#1a3578] text-white px-4 py-2 rounded-lg font-medium transition shadow-sm">Add</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── HR Chatbot Overlay ─────────────────────────────────────────────── */}
        {showChat && (
          <div className="hr-chat-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowChat(false); }}>
            <div className="hr-chat-window" id="hr-chatbot-window">
              <div className="hr-chat-header">
                <div className="hr-chat-header-left">
                  <div className="hr-chat-avatar">🤖</div>
                  <div>
                    <div className="hr-chat-title">HR AI Assistant</div>
                    <div className="hr-chat-subtitle"><span className="online-dot" />Connected to all HR data</div>
                  </div>
                </div>
                <button className="hr-chat-close" onClick={() => setShowChat(false)}>✕</button>
              </div>

              <div className="hr-chat-messages" id="hr-chatbot-messages">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`msg-row ${msg.sender}`}>
                    <div className={`msg-avatar ${msg.sender}`}>
                      {msg.sender === "bot" ? "🤖" : "👤"}
                    </div>
                    {msg.sender === "bot" ? (
                      <BotMessageCard text={msg.text} />
                    ) : (
                      <div className="user-bubble">{msg.text}</div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="msg-row bot">
                    <div className="msg-avatar bot">🤖</div>
                    <div className="typing-indicator">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {messages.length <= 1 && (
                <div className="suggestions-bar">
                  {suggestions.map((s, i) => (
                    <button key={i} className="suggestion-chip"
                      onClick={() => { setInputMsg(s); }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <form className="hr-chat-input-area" onSubmit={handleSendMessage} id="hr-chatbot-form">
                <input
                  id="hr-chatbot-input"
                  className="hr-chat-input"
                  type="text"
                  placeholder="Ask me anything about HR data…"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  autoComplete="off"
                />
                <button type="submit" className="hr-chat-send" id="hr-chatbot-send" disabled={isTyping}>
                  {isTyping ? "⏳" : "➤"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

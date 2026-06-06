import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJob } from "../api/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function HRDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    location: "",
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveCount, setLeaveCount] = useState(0);
  const [payrollSummary, setPayrollSummary] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const navigate = useNavigate();

  // 🚀 Optimized parallel data fetching
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

        // ✅ Attendance
        setAttendanceData(attendanceData || []);

        // ✅ Leave (Only Pending)
        const pending = leaveData?.filter((l) => l.status === "Pending") || [];
        setLeaveCount(pending.length);

        // ✅ Payroll Summary
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

        // ✅ Active Project
        const active = projectsData?.find((p) => p.status === "Active");
        setActiveProject(active || null);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // 📊 Attendance Chart
  const presentCount = attendanceData.length;
  const attendanceChart = [
    { name: "Present", value: presentCount },
    { name: "Remaining", value: Math.max(0, 100 - presentCount) },
  ];
  const COLORS = ["#1E3A8A", "#E5E7EB"];

  // ✨ Job Submit
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

  // 🧭 Feature Cards Section (with better content)
  const features = [
    {
      title: "Jobs",
      description:
        "Post new job openings, publish them instantly, and track applicants throughout the hiring pipeline.",
      onClick: () => setShowModal(true),
    },
    {
      title: "Bulk Resume Screening",
      description:
        "Upload multiple resumes and let AI auto-screen and rank top candidates instantly.",
      onClick: () => navigate("/hr/resume-screening"),
    },
    {
      title: "Onboarding",
      description:
        "Manage candidate onboarding: start, track status, or withdraw when needed.",
      onClick: () => navigate("/hr/onboarding"),
    },
    {
      title: "Interviews",
      description:
        "Schedule and manage interviews, monitor slots, and keep track of candidate progress seamlessly.",
      onClick: () => navigate("/hr/interviews"),
    },
    {
      title: "View Applications",
      description:
        "Access candidate applications, view resumes, apply filters, and streamline your recruitment process.",
      onClick: () => navigate("/hr/applications"),
    },
    {
      title: "Employee Management",
      description:
        "View and manage employee profiles, roles, and departments — all from one place.",
      onClick: () => navigate("/hr/employee-management"),
    },
    {
      title: "Feedback",
      description:
        "Collect, analyze and review employee feedback to enhance engagement and work culture.",
      onClick: () => navigate("/hr/feedback"),
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-8 pt-20 text-gray-800 font-inter flex flex-col justify-between">
      <div>
        <h1 className="text-3xl font-bold mb-8 tracking-tight text-center">
          HR Dashboard
        </h1>

        {/* 📊 Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-[1300px] mx-auto">
          {/* Attendance */}
          <div
            onClick={() => navigate("/hr/attendance")}
            className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-lg font-semibold mb-2">Today's Attendance</h2>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={attendanceChart}
                    innerRadius={45}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {attendanceChart.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center font-bold">{presentCount}% Present</p>
            <p className="text-center text-sm text-gray-500 mt-1">
              Click to view detailed attendance logs
            </p>
          </div>

          {/* Leave Requests */}
          <div
            onClick={() => navigate("/hr/leave")}
            className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition cursor-pointer text-center"
          >
            <h2 className="text-lg font-semibold mb-2">Pending Leave Requests</h2>
            <p className="text-4xl font-bold text-indigo-600">
              {leaveCount}
            </p>
            <p className="text-gray-500">
              {leaveCount > 0
                ? "Requests awaiting your action"
                : "No pending requests"}
            </p>
          </div>

          {/* Payroll */}
          <div
            onClick={() => navigate("/hr/payroll")}
            className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-lg font-semibold mb-4">Payroll Distribution</h2>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={payrollSummary}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1E3A8A" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-center text-sm text-gray-500 mt-1">
              View payroll details and monthly breakdown
            </p>
          </div>
        </div>

        {/* 🧭 Feature Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1300px] mx-auto">
          {/* ✅ Project Card */}
          <div
            onClick={() => navigate("/hr/projects")}
            className="bg-white rounded-xl p-6 shadow hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer h-[180px] flex flex-col justify-center"
          >
            <h3 className="text-lg font-semibold mb-2 text-gray-800 tracking-tight">
              Current Project
            </h3>
            {activeProject ? (
              <>
                <p className="text-indigo-600 font-semibold text-lg">
                  {activeProject.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Deadline: {new Date(activeProject.deadline).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500 mt-2 italic">
                  View past projects & manage progress →
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                No active project.{" "}
                <span className="underline text-indigo-600">
                  Click here
                </span>{" "}
                to view past projects.
              </p>
            )}
          </div>

          {/* Other Feature Cards */}
          {features.map((f, idx) => (
            <div
              key={idx}
              onClick={f.onClick}
              className="bg-white rounded-xl p-6 shadow hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer h-[180px] flex flex-col justify-center"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-800 hover:text-indigo-600 transition-colors tracking-tight">
                {f.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 📝 Job Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white text-black p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">Add Job</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Job Title"
                value={jobData.title}
                onChange={(e) =>
                  setJobData({ ...jobData, title: e.target.value })
                }
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={jobData.description}
                onChange={(e) =>
                  setJobData({ ...jobData, description: e.target.value })
                }
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={jobData.location}
                onChange={(e) =>
                  setJobData({ ...jobData, location: e.target.value })
                }
                className="w-full mb-3 p-2 border rounded"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1E3A8A] hover:bg-[#1a3578] text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

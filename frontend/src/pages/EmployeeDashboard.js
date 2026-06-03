import React from "react";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Projects",
      description: "Access and track your assigned projects. Stay updated with deadlines and progress.",
      onClick: () => navigate("/employee/projects"),
    },
    {
      title: "Attendance",
      description: "Check your attendance records and mark your daily attendance seamlessly.",
      onClick: () => navigate("/employee/attendance"),
    },
    {
      title: "Payroll",
      description: "View and download your latest payslips, allowances, and deductions.",
      onClick: () => navigate("/employee/payroll"),
    },
    {
      title: "Leave Requests",
      description: "Submit new leave requests or track the status of your previous requests.",
      onClick: () => navigate("/employee/leave"),
    },
    {
      title: "Feedback",
      description: "Share your feedback directly with HR — completely secure and confidential.",
      onClick: () => navigate("/employee/feedback"),
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-8 pt-20 text-gray-800 font-inter flex flex-col justify-between">
      <div>
        <h1 className="text-3xl font-bold mb-8 tracking-tight text-center">
          Employee Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1300px] mx-auto">
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
    </div>
  );
}

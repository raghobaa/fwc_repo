import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const cards = [
    {
      title: "User Management",
      description: "Create and manage Admin, HR, Employee and Candidate accounts. Assign and change roles.",
      action: () => navigate("/admin/users"),
      badge: "Core",
      badgeColor: "bg-red-100 text-red-700",
    },
    {
      title: "HR Dashboard",
      description: "Access all HR tools — attendance, leave requests, payroll, onboarding, and interviews.",
      action: () => navigate("/hr"),
      badge: "HR Tools",
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      title: "Recruitment",
      description: "View job postings, review candidate applications, and manage resume screening.",
      action: () => navigate("/hr/applications"),
      badge: "Hiring",
      badgeColor: "bg-green-100 text-green-700",
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-8 pt-20 text-gray-800">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user.name || "Admin"}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {cards.map((card, i) => (
            <div
              key={i}
              onClick={card.action}
              className="cursor-pointer bg-white rounded-2xl shadow border border-gray-200 p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-snug">{card.description}</p>
              </div>
              <div className="mt-4 text-sm font-medium text-gray-800 hover:underline">
                Open →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

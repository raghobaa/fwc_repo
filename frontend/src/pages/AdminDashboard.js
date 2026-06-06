import React from "react";

export default function AdminDashboard() {
  const features = [
    {
      title: "User & HR Management",
      description: "Manage HR accounts, employee records, and access controls to ensure smooth operations.",
      onClick: () => alert("User & HR Management feature coming soon!"),
    },
    {
      title: "Analytics",
      description: "View insights like hiring stats, attendance reports, and payroll trends in one place.",
      onClick: () => alert("Analytics feature coming soon!"),
    },
    {
      title: "System Tools",
      description: "Access system settings, audit logs, and advanced configurations.",
      onClick: () => alert("System Tools feature coming soon!"),
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-8 pt-20 text-gray-800 font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-10 tracking-tight text-center">
          Admin Dashboard
        </h1>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {features.map((f, i) => (
            <div
              key={i}
              onClick={f.onClick}
              className="cursor-pointer bg-white rounded-2xl shadow-lg border border-gray-200 p-8 flex flex-col justify-between h-48 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-600 leading-snug line-clamp-3">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";

const PERMISSIONS = [
  { feature: "User Management", description: "Create, edit, delete users & change roles", Admin: true, HR: false, Employee: false, Candidate: false },
  { feature: "Department Management", description: "Create and manage departments", Admin: true, HR: false, Employee: false, Candidate: false },
  { feature: "Announcements", description: "Post and manage company-wide notices", Admin: true, HR: false, Employee: false, Candidate: false },
  { feature: "View Announcements", description: "Read company announcements", Admin: true, HR: true, Employee: true, Candidate: true },
  { feature: "Recruitment / Job Postings", description: "Create and manage job listings", Admin: true, HR: true, Employee: false, Candidate: false },
  { feature: "Apply for Jobs", description: "Submit job applications", Admin: false, HR: false, Employee: false, Candidate: true },
  { feature: "Resume Screening", description: "Run AI resume screening", Admin: true, HR: true, Employee: false, Candidate: false },
  { feature: "View Applications", description: "See all candidate applications", Admin: true, HR: true, Employee: false, Candidate: false },
  { feature: "Interview Scheduling", description: "Schedule and manage interviews", Admin: true, HR: true, Employee: false, Candidate: false },
  { feature: "View Own Interviews", description: "See scheduled interview details", Admin: false, HR: false, Employee: false, Candidate: true },
  { feature: "Attendance Marking", description: "Mark daily attendance", Admin: false, HR: false, Employee: true, Candidate: false },
  { feature: "View Attendance", description: "View all attendance records", Admin: true, HR: true, Employee: false, Candidate: false },
  { feature: "Leave Requests", description: "Submit leave requests", Admin: false, HR: false, Employee: true, Candidate: false },
  { feature: "Approve / Reject Leave", description: "Handle employee leave requests", Admin: true, HR: true, Employee: false, Candidate: false },
  { feature: "Payroll Generation", description: "Generate and release payroll", Admin: true, HR: true, Employee: false, Candidate: false },
  { feature: "View Own Payroll", description: "See personal payroll slips", Admin: false, HR: false, Employee: true, Candidate: false },
  { feature: "Feedback Submission", description: "Submit employee feedback", Admin: false, HR: false, Employee: true, Candidate: false },
  { feature: "View All Feedback", description: "See all employee feedback", Admin: true, HR: true, Employee: false, Candidate: false },
  { feature: "Project Management", description: "Create and manage projects", Admin: true, HR: true, Employee: false, Candidate: false },
  { feature: "View Own Projects", description: "See assigned projects", Admin: false, HR: false, Employee: true, Candidate: false },
  { feature: "Onboarding Management", description: "Manage candidate onboarding", Admin: true, HR: true, Employee: false, Candidate: false },
  { feature: "View Onboarding Status", description: "See own onboarding progress", Admin: false, HR: false, Employee: false, Candidate: true },
  { feature: "AI Talent Heatmap", description: "View department skill analytics", Admin: true, HR: true, Employee: false, Candidate: false },
  { feature: "AI Interview", description: "Take AI-powered voice interview", Admin: false, HR: false, Employee: false, Candidate: true },
];

const ROLES = ["Admin", "HR", "Employee", "Candidate"];
const ROLE_COLORS = {
  Admin: "text-red-700 bg-red-50",
  HR: "text-blue-700 bg-blue-50",
  Employee: "text-green-700 bg-green-50",
  Candidate: "text-yellow-700 bg-yellow-50",
};

function Check({ allowed }) {
  return allowed
    ? <span className="text-green-600 font-bold text-lg">✓</span>
    : <span className="text-gray-300 text-lg">✗</span>;
}

export default function AdminPermissionsPage() {
  const navigate = useNavigate();

  const totalPerRole = ROLES.reduce((acc, role) => {
    acc[role] = PERMISSIONS.filter(p => p[role]).length;
    return acc;
  }, {});

  return (
    <div className="bg-gray-100 min-h-screen p-6 pt-20">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate("/admin")} className="text-sm text-gray-500 hover:text-gray-800 mb-1">← Back to Dashboard</button>
          <h1 className="text-2xl font-bold text-gray-800">Role & Permission Matrix</h1>
          <p className="text-sm text-gray-500 mt-1">Read-only view of what each role can access in the system</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {ROLES.map(role => (
            <div key={role} className={`bg-white rounded-xl border shadow p-4 text-center`}>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${ROLE_COLORS[role]}`}>{role}</span>
              <p className="text-2xl font-bold text-gray-800">{totalPerRole[role]}</p>
              <p className="text-xs text-gray-500">of {PERMISSIONS.length} features</p>
            </div>
          ))}
        </div>

        {/* Permission Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600 w-64">Feature</th>
                  <th className="text-left p-4 font-semibold text-gray-500 text-xs w-48 hidden md:table-cell">Description</th>
                  {ROLES.map(role => (
                    <th key={role} className="p-4 font-semibold text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${ROLE_COLORS[role]}`}>{role}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((perm, i) => (
                  <tr key={i} className={`border-b ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-blue-50/20 transition`}>
                    <td className="p-4 font-medium text-gray-800">{perm.feature}</td>
                    <td className="p-4 text-gray-400 text-xs hidden md:table-cell">{perm.description}</td>
                    {ROLES.map(role => (
                      <td key={role} className="p-4 text-center"><Check allowed={perm[role]} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t">
                <tr>
                  <td className="p-4 font-semibold text-gray-700">Total Permissions</td>
                  <td className="hidden md:table-cell" />
                  {ROLES.map(role => (
                    <td key={role} className="p-4 text-center font-bold text-gray-800">{totalPerRole[role]}</td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          This matrix is based on the current backend route-level authorization configuration.
        </p>
      </div>
    </div>
  );
}

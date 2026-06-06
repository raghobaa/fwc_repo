import React, { useEffect, useState } from "react";

export default function HREmployeeManagementPage() {
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    const token = localStorage.getItem("token");
    const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const res = await fetch(`${BASE}/api/hr/employees`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setEmployees(data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-8 pt-20 text-gray-800 font-inter">
      <h1 className="text-3xl font-bold mb-8 tracking-tight text-center">
        Employee Management
      </h1>

      <div className="overflow-x-auto max-w-4xl mx-auto">
        <table className="w-full text-left border border-gray-300 bg-white rounded-xl shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-sm font-semibold text-gray-700">Name</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Email</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr
                key={emp._id}
                className="border-t border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="p-3">{emp.name}</td>
                <td className="p-3">{emp.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

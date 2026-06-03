import React, { useEffect, useState } from "react";

export default function HRAttendancePage() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem("token");
        const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const res = await fetch(`${BASE}/api/hr/attendance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setEmployees(data);
        }
      } catch (error) {
        console.error("Failed to fetch attendance", error);
      }
    };

    fetchAttendance();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-8 pt-20 text-gray-800 font-inter">
      <h1 className="text-3xl font-bold mb-8 tracking-tight text-center">
        Attendance Management
      </h1>

      <div className="overflow-x-auto max-w-5xl mx-auto">
        <table className="w-full text-left border border-gray-300 bg-white rounded-xl shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-sm font-semibold text-gray-700">Name</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Email</th>
              <th className="p-3 text-sm font-semibold text-gray-700">
                Total Attendance
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp) => (
                <tr
                  key={emp._id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="p-3">{emp.name}</td>
                  <td className="p-3">{emp.email}</td>
                  <td className="p-3">{emp.totalAttendance}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="text-center p-4 text-gray-500 font-medium"
                >
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

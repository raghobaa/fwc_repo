import React, { useState } from "react";

export default function EmployeeAttendancePage() {
  const [status, setStatus] = useState("");

  const handleMarkAttendance = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setStatus("❌ No token found. Please log in again.");
      return;
    }

    try {
      const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await fetch(`${BASE}/api/employee/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setStatus(`✅ ${data.message}`);
      } else {
        setStatus(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Something went wrong");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-8 pt-20 text-gray-800 font-inter">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2 tracking-tight">
          Employee Attendance
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Mark your attendance for today. Attendance can only be marked once per day.
        </p>

        <button
          onClick={handleMarkAttendance}
          className="bg-[#1E3A8A] hover:bg-[#1a3578] text-white px-6 py-2 rounded-lg font-medium transition shadow-sm hover:shadow-lg"
        >
          Mark Attendance
        </button>

        {status && (
          <p
            className={`mt-6 text-sm font-medium ${
              status.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
}

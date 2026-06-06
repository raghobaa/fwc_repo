import React, { useState, useEffect } from "react";

export default function EmployeeLeavePage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState([]);

  // ✅ Submit Leave Request
  const submitLeave = async () => {
    try {
      const token = localStorage.getItem("token");
      const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await fetch(`${BASE}/api/employee/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ startDate, endDate, reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("Leave submitted successfully");
        setStartDate("");
        setEndDate("");
        setReason("");
        fetchHistory(); // refresh history after submitting
      } else {
        setStatus(data.message);
      }
    } catch (err) {
      console.error(err);
      setStatus("Something went wrong");
    }
  };

  // 📜 Fetch Employee Leave History
  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await fetch(`${BASE}/api/employee/leave`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setHistory(data);
    } catch (err) {
      console.error("Error fetching leave history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-8 pt-20 text-gray-800 font-inter">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 tracking-tight text-center">
          Leave Request
        </h1>

        {/* 📝 Leave Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <textarea
            placeholder="Enter reason for leave..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={submitLeave}
            className="w-full bg-[#1E3A8A] hover:bg-[#162c6a] text-white px-6 py-2 rounded-lg font-medium transition shadow-sm hover:shadow-md"
          >
            Submit Leave Request
          </button>

          {status && (
            <p
              className={`mt-2 text-sm font-medium ${
                status.includes("successfully") ? "text-green-600" : "text-red-600"
              }`}
            >
              {status}
            </p>
          )}
        </div>

        {/* 🕒 Leave History Table */}
        <h2 className="text-2xl font-semibold mb-4 text-center">Your Leave History</h2>
        {history.length === 0 ? (
          <p className="text-center text-gray-500">No leave requests found.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3 text-gray-700 font-semibold">Start Date</th>
                  <th className="p-3 text-gray-700 font-semibold">End Date</th>
                  <th className="p-3 text-gray-700 font-semibold">Reason</th>
                  <th className="p-3 text-gray-700 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((req) => (
                  <tr
                    key={req._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3">
                      {new Date(req.startDate).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      {new Date(req.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-3">{req.reason}</td>
                    <td
                      className={`p-3 font-semibold ${
                        req.status === "Approved"
                          ? "text-green-600"
                          : req.status === "Rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {req.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

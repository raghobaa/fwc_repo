import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

export default function HRLeaveRequestsPage() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const token = localStorage.getItem("token");
    const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const res = await fetch(`${BASE}/api/hr/leave`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setRequests(data);
  };

  const handleAction = async (id, status) => {
    const token = localStorage.getItem("token");
    const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
    await fetch(`${BASE}/api/hr/leave/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <DashboardLayout>
      <div className="bg-gray-100 min-h-screen p-8 text-gray-800 font-inter">
        <h1 className="text-3xl font-bold mb-8 text-center tracking-tight">
          Leave Requests
        </h1>

        {requests.length === 0 ? (
          <p className="text-center text-gray-500">No leave requests found.</p>
        ) : (
          <div className="overflow-x-auto max-w-5xl mx-auto">
            <table className="w-full text-left border border-gray-300 bg-white rounded-xl shadow">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Start Date</th>
                  <th className="p-3">End Date</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req._id}
                    className="border-t border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="p-3">{req.employeeId?.name}</td>
                    <td className="p-3">{req.employeeId?.email}</td>
                    <td className="p-3">
                      {new Date(req.startDate).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      {new Date(req.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-3">{req.reason}</td>
                    <td className="p-3 font-medium text-gray-700">
                      {req.status}
                    </td>
                    <td className="p-3 text-center">
                      {req.status === "Pending" && (
                        <div className="flex justify-center gap-2">
                          {/* ✅ Approve Button */}
                          <button
                            onClick={() => handleAction(req._id, "Approved")}
                            className="bg-[#1E3A8A] hover:bg-[#162c6a] text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200 shadow-sm hover:shadow-md focus:outline-none"
                          >
                            Approve
                          </button>

                          {/* ❌ Reject Button */}
                          <button
                            onClick={() => handleAction(req._id, "Rejected")}
                            className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200 shadow-sm hover:shadow-md focus:outline-none"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

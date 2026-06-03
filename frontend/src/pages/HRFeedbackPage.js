import React, { useEffect, useState } from "react";

export default function HRFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const token = localStorage.getItem("token");
      const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await fetch(`${BASE}/api/hr/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFeedbacks(data);
    };
    fetchFeedbacks();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-8 pt-20 text-gray-800 font-inter">
      <h1 className="text-3xl font-bold mb-8 tracking-tight text-center">
        Employee Feedback
      </h1>
      {feedbacks.length === 0 ? (
        <p className="text-center text-gray-500">No feedback available.</p>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          {feedbacks.map((f) => (
            <div
              key={f._id}
              className="bg-white rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-lg">{f.employeeId?.name}</p>
                  <p className="text-sm text-gray-500">
                    {f.employeeId?.email}
                  </p>
                </div>
                <p className="text-sm text-gray-400">
                  {new Date(f.createdAt).toLocaleString()}
                </p>
              </div>

              <p className="text-base mb-3">{f.message}</p>

              <div className="flex items-center gap-2">
                <span className="text-[#1E3A8A] font-semibold text-base">
                  Rating: {f.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

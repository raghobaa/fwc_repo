import React, { useState } from "react";

export default function EmployeeFeedbackPage() {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState("");

  const submitFeedback = async () => {
    try {
      const token = localStorage.getItem("token");
      const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await fetch(`${BASE}/api/employee/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message, rating }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("Feedback submitted successfully");
        setMessage("");
        setRating(5);
      } else {
        setStatus(data.message);
      }
    } catch (err) {
      console.error(err);
      setStatus("Something went wrong");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-8 pt-20 text-gray-800 font-inter">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2 tracking-tight">
          Employee Feedback
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Share your feedback with HR. Your feedback helps us build a better workplace.
        </p>

        <div className="space-y-4 text-left">
          <textarea
            placeholder="Enter your feedback..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
          />

          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                Rating: {num}
              </option>
            ))}
          </select>

          <button
            onClick={submitFeedback}
            className="bg-[#1E3A8A] hover:bg-[#1a3578] text-white px-6 py-2 rounded-lg font-medium transition shadow-sm hover:shadow-lg w-full"
          >
            Submit Feedback
          </button>

          {status && (
            <p
              className={`mt-4 text-sm font-medium text-center ${
                status.includes("successfully") ? "text-green-600" : "text-red-600"
              }`}
            >
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

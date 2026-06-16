import React, { useState } from "react";
import { Send, CheckCircle, AlertCircle, Star, MessageSquare } from "lucide-react";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5002";

export default function EmployeeFeedbackPage() {
  const [message, setMessage] = useState("");
  const [rating,  setRating]  = useState(0);
  const [status,  setStatus]  = useState(null); // { text, ok }
  const [submitting, setSubmitting] = useState(false);

  const submitFeedback = async () => {
    if (!message.trim()) { setStatus({ text: "Please enter your feedback.", ok: false }); return; }
    if (!rating)         { setStatus({ text: "Please select a rating.",      ok: false }); return; }
    setSubmitting(true);
    setStatus(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/api/employee/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message, rating }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ text: "Feedback submitted. Thank you!", ok: true });
        setMessage(""); setRating(0);
      } else {
        setStatus({ text: data.message || "Failed to submit.", ok: false });
      }
    } catch {
      setStatus({ text: "Something went wrong. Please try again.", ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-8 pt-20 pb-10">

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
        <p className="text-gray-500 text-sm mt-1">Share your thoughts with HR — your response is confidential</p>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6 space-y-5">

          {/* Icon header */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 rounded-xl w-10 h-10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Employee Feedback</p>
              <p className="text-xs text-gray-400">Helps us build a better workplace</p>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Your Feedback</label>
            <textarea
              placeholder="Share your thoughts, suggestions, or concerns..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-800"
            />
          </div>

          {/* Star rating */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className="h-8 w-8 transition-colors"
                    fill={n <= rating ? "#f59e0b" : "none"}
                    stroke={n <= rating ? "#f59e0b" : "#d1d5db"}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="self-center text-sm text-gray-500 ml-1">
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={submitFeedback}
            disabled={submitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm w-full justify-center"
          >
            {submitting
              ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Submitting...</>
              : <><Send className="h-4 w-4" />Submit Feedback</>
            }
          </button>

          {/* Status */}
          {status && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${status.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {status.ok ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
              {status.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

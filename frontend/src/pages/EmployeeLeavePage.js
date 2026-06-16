import React, { useState, useEffect } from "react";
import { Calendar, CheckCircle, Clock, XCircle, Send, AlertCircle } from "lucide-react";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5002";
const MAX_LEAVES = 20;

const STATUS_CFG = {
  Approved: { color: "bg-green-100 text-green-700", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  Rejected: { color: "bg-red-100 text-red-600",    icon: <XCircle className="h-3.5 w-3.5" />    },
  Pending:  { color: "bg-yellow-100 text-yellow-700", icon: <Clock className="h-3.5 w-3.5" />   },
};

function daysBetween(start, end) {
  const s = new Date(start), e = new Date(end);
  return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
}

export default function EmployeeLeavePage() {
  const [startDate, setStartDate] = useState("");
  const [endDate,   setEndDate]   = useState("");
  const [reason,    setReason]    = useState("");
  const [message,   setMessage]   = useState(null); // { text, ok }
  const [history,   setHistory]   = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/api/employee/leave`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setHistory(await res.json());
    } catch {}
  };

  useEffect(() => { fetchHistory(); }, []);

  const submitLeave = async () => {
    if (!startDate || !endDate || !reason.trim()) {
      setMessage({ text: "Please fill in all fields.", ok: false });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/api/employee/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ startDate, endDate, reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Leave request submitted successfully.", ok: true });
        setStartDate(""); setEndDate(""); setReason("");
        fetchHistory();
      } else {
        setMessage({ text: data.message || "Failed to submit.", ok: false });
      }
    } catch {
      setMessage({ text: "Something went wrong. Please try again.", ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  // Derived stats
  const approved = history.filter(h => h.status === "Approved").length;
  const pending  = history.filter(h => h.status === "Pending").length;
  const rejected = history.filter(h => h.status === "Rejected").length;
  const balance  = Math.max(0, MAX_LEAVES - approved);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-8 pt-20 pb-10 space-y-8">

        {/* Page title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Requests</h1>
          <p className="text-gray-500 text-sm mt-1">Submit and track your leave applications</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <Calendar className="h-5 w-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{balance}</p>
            <p className="text-xs text-gray-500 mt-0.5">Days Available</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{approved}</p>
            <p className="text-xs text-gray-500 mt-0.5">Approved</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <Clock className="h-5 w-5 text-yellow-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{pending}</p>
            <p className="text-xs text-gray-500 mt-0.5">Pending</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <XCircle className="h-5 w-5 text-red-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{rejected}</p>
            <p className="text-xs text-gray-500 mt-0.5">Rejected</p>
          </div>
        </div>

        {/* Submit form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">New Leave Request</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {startDate && endDate && endDate >= startDate && (
            <p className="text-xs text-blue-600 mb-3 font-medium">
              Duration: {daysBetween(startDate, endDate)} day{daysBetween(startDate, endDate) !== 1 ? "s" : ""}
            </p>
          )}

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Reason</label>
            <textarea
              placeholder="Briefly describe the reason for your leave..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            onClick={submitLeave}
            disabled={submitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm"
          >
            {submitting
              ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Submitting...</>
              : <><Send className="h-4 w-4" />Submit Request</>
            }
          </button>

          {message && (
            <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${message.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {message.ok ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
              {message.text}
            </div>
          )}
        </div>

        {/* Leave history */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1 w-10 bg-blue-600 rounded-full" />
            <h2 className="text-xl font-bold text-gray-900">Leave History</h2>
          </div>

          {history.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
              <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No leave requests yet</p>
              <p className="text-sm text-gray-400 mt-1">Submit your first request above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(req => {
                const cfg = STATUS_CFG[req.status] || STATUS_CFG.Pending;
                const days = daysBetween(req.startDate, req.endDate);
                return (
                  <div key={req._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
                    <div className="bg-blue-50 rounded-xl w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{req.reason}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(req.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {" → "}
                        {new Date(req.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {" · "}{days} day{days !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.color}`}>
                      {cfg.icon}{req.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Fingerprint, CheckCircle, XCircle, Clock, Calendar,
  TrendingUp, AlertCircle, ChevronLeft, ChevronRight
} from "lucide-react";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5002";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function EmployeeAttendancePage() {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [message, setMessage] = useState(null); // { text, type: "success"|"error" }
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const token = localStorage.getItem("token");

  const fetchAttendance = useCallback(async () => {
    if (!token) { navigate("/"); return; }
    try {
      const res = await fetch(`${BASE}/api/employee/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAttendance(await res.json());
    } catch {
      setMessage({ text: "Failed to load attendance data.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const handleMarkAttendance = async () => {
    setMarking(true);
    setMessage(null);
    try {
      const res = await fetch(`${BASE}/api/employee/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message || "Attendance marked successfully!", type: "success" });
        fetchAttendance();
      } else {
        setMessage({ text: data.message || "Failed to mark attendance.", type: "error" });
      }
    } catch {
      setMessage({ text: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setMarking(false);
    }
  };

  // Build calendar grid for calendarMonth
  const buildCalendar = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Map records to date strings for fast lookup
    const presentDates = new Set(
      (attendance?.records || [])
        .filter(r => r.status === "Present")
        .map(r => new Date(r.date).toDateString())
    );

    const today = new Date();
    const cells = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) cells.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const isToday = date.toDateString() === today.toDateString();
      const isPresent = presentDates.has(date.toDateString());
      const isPast = date < today && !isToday;
      cells.push({ d, date, isToday, isPresent, isPast });
    }
    return cells;
  };

  const today = new Date();
  const cells = buildCalendar();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-8 pt-20 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Mark Your Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">{DAYS[today.getDay()]}, {MONTHS[today.getMonth()]} {today.getDate()}, {today.getFullYear()}</p>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{attendance?.presentThisMonth ?? "—"}</p>
            <p className="text-xs text-gray-500 mt-0.5">Present This Month</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <XCircle className="h-5 w-5 text-red-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{attendance?.absentThisMonth ?? "—"}</p>
            <p className="text-xs text-gray-500 mt-0.5">Absent This Month</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <TrendingUp className="h-5 w-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{attendance?.attendancePct ?? "—"}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Attendance Rate</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <Calendar className="h-5 w-5 text-purple-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{attendance?.totalPresent ?? "—"}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Days Present</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 pb-10 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Mark Attendance Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${attendance?.markedToday ? "bg-green-100" : "bg-blue-50"}`}>
            {attendance?.markedToday
              ? <CheckCircle className="h-12 w-12 text-green-500" />
              : <Fingerprint className="h-12 w-12 text-blue-600" />
            }
          </div>

          {attendance?.markedToday ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You're Marked Present</h2>
              <p className="text-gray-500 text-sm mb-6">Your attendance for today has been successfully recorded.</p>
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-5 py-2.5 rounded-full text-sm font-semibold">
                <CheckCircle className="h-4 w-4" />
                Present — {MONTHS[today.getMonth()]} {today.getDate()}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Marked Yet</h2>
              <p className="text-gray-500 text-sm mb-6">Mark your attendance for today. You can only mark it once per day.</p>
              <button
                onClick={handleMarkAttendance}
                disabled={marking}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-semibold transition shadow-md hover:shadow-lg flex items-center gap-2"
              >
                {marking ? (
                  <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Marking...</>
                ) : (
                  <><Fingerprint className="h-5 w-5" />Mark Attendance</>
                )}
              </button>
            </>
          )}

          {/* Feedback message */}
          {message && (
            <div className={`mt-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium w-full justify-center ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {message.type === "success"
                ? <CheckCircle className="h-4 w-4 flex-shrink-0" />
                : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
              {message.text}
            </div>
          )}

          {/* Attendance rate progress bar */}
          {attendance && (
            <div className="mt-8 w-full">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Monthly Attendance Rate</span>
                <span className="font-semibold text-gray-700">{attendance.attendancePct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${attendance.attendancePct >= 85 ? "bg-green-500" : attendance.attendancePct >= 60 ? "bg-yellow-400" : "bg-red-400"}`}
                  style={{ width: `${attendance.attendancePct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{attendance.attendancePct >= 85 ? "Great attendance! Keep it up." : "Try to improve your attendance rate above 85%."}</p>
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-900">{MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}</h3>
            <div className="flex gap-1">
              <button
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <ChevronLeft className="h-4 w-4 text-gray-500" />
              </button>
              <button
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              if (!cell) return <div key={`empty-${i}`} />;
              return (
                <div
                  key={cell.d}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition
                    ${cell.isToday ? "ring-2 ring-blue-500 ring-offset-1" : ""}
                    ${cell.isPresent ? "bg-green-100 text-green-700" : cell.isPast ? "bg-red-50 text-red-400" : "text-gray-400"}
                  `}
                >
                  {cell.d}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-100"></div>Present</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-50"></div>Absent</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded ring-2 ring-blue-500"></div>Today</div>
          </div>
        </div>
      </div>

      {/* Recent records */}
      {attendance?.records?.length > 0 && (
        <div className="max-w-5xl mx-auto px-8 pb-10 mt-0">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Attendance Records</h3>
            <div className="space-y-2">
              {[...attendance.records].reverse().slice(0, 10).map((rec, i) => {
                const d = new Date(rec.date);
                return (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${rec.status === "Present" ? "bg-green-100" : "bg-red-100"}`}>
                        {rec.status === "Present"
                          ? <CheckCircle className="h-4 w-4 text-green-600" />
                          : <XCircle className="h-4 w-4 text-red-500" />}
                      </div>
                      <span className="text-sm text-gray-700">{DAYS[d.getDay()]}, {MONTHS[d.getMonth()]} {d.getDate()}</span>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${rec.status === "Present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {rec.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

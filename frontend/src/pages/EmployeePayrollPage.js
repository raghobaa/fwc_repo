import React, { useEffect, useState } from "react";
import { generatePayslipPDF } from "../utils/pdfGenerator";
import {
  DollarSign, TrendingUp, TrendingDown, Download,
  Calendar, ChevronDown, ChevronUp, CheckCircle, Clock
} from "lucide-react";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5002";

const MONTHS = ["January","February","March","April","May","June",
                 "July","August","September","October","November","December"];
const YEARS  = ["2024","2025","2026"];

function fmt(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

export default function EmployeePayrollPage() {
  const [payrolls, setPayrolls]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filterMonth, setFilterMonth]   = useState("");
  const [filterYear, setFilterYear]     = useState("");
  const [expanded, setExpanded]         = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    fetch(`${BASE}/api/hr/payroll/employee`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setPayrolls(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayed = payrolls.filter(p => {
    const [mon, yr] = (p.month || "").split(" ");
    if (filterMonth && mon !== filterMonth) return false;
    if (filterYear  && yr  !== filterYear)  return false;
    return true;
  });

  // Summary stats
  const currentYear = new Date().getFullYear().toString();
  const ytd = payrolls
    .filter(p => (p.month || "").includes(currentYear))
    .reduce((s, p) => s + (p.netPay || 0), 0);
  const latest    = payrolls[0];
  const ytdDeduct = payrolls
    .filter(p => (p.month || "").includes(currentYear))
    .reduce((s, p) => s + (p.deductions || 0), 0);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-8 pt-20 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Salary Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Your earnings, deductions, and payslip history</p>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <TrendingUp className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{fmt(ytd)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Earned {currentYear}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <DollarSign className="h-5 w-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{latest ? fmt(latest.netPay) : "—"}</p>
            <p className="text-xs text-gray-500 mt-0.5">Latest Net Pay {latest ? `(${latest.month})` : ""}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <TrendingDown className="h-5 w-5 text-red-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{fmt(ytdDeduct)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Deducted {currentYear}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-6">

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 items-center mb-6">
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Months</option>
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Years</option>
            {YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
          {(filterMonth || filterYear) && (
            <button
              onClick={() => { setFilterMonth(""); setFilterYear(""); }}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Clear filter
            </button>
          )}
          <span className="ml-auto text-sm text-gray-400">{displayed.length} record{displayed.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Payroll list */}
        {displayed.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No payroll records found</p>
            <p className="text-sm text-gray-400 mt-1">
              {payrolls.length > 0 ? "Try a different month or year filter." : "HR hasn't generated your payroll yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((p) => {
              const isOpen = expanded === p._id;
              return (
                <div key={p._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Row header — always visible */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : p._id)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition text-left"
                  >
                    <div className="bg-blue-50 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900">{p.month}</p>
                      <p className="text-xs text-gray-400">Base {fmt(p.baseSalary)} · Bonus {fmt(p.bonus)} · Deductions {fmt(p.deductions)}</p>
                    </div>
                    <div className="text-right flex-shrink-0 mr-3">
                      <p className="text-xl font-bold text-green-600">{fmt(p.netPay)}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        p.status === "Released"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {p.status === "Released" ? "Released" : "Approved"}
                      </span>
                    </div>
                    {isOpen
                      ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    }
                  </button>

                  {/* Expanded breakdown */}
                  {isOpen && (
                    <div className="border-t border-gray-50 px-6 py-5">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                        {[
                          { label: "Base Salary",  value: fmt(p.baseSalary), color: "text-gray-900" },
                          { label: "Bonus",        value: fmt(p.bonus),      color: "text-green-600" },
                          { label: "Deductions",   value: fmt(p.deductions), color: "text-red-500"   },
                          { label: "Net Pay",      value: fmt(p.netPay),     color: "text-blue-600"  },
                        ].map(item => (
                          <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          {p.status === "Released"
                            ? <><CheckCircle className="h-3.5 w-3.5 text-green-500" />Released on {new Date(p.updatedAt || p.createdAt).toLocaleDateString("en-IN")}</>
                            : <><Clock className="h-3.5 w-3.5 text-yellow-500" />Pending release</>
                          }
                        </div>
                        <button
                          onClick={() => generatePayslipPDF(p)}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition shadow-sm"
                        >
                          <Download className="h-4 w-4" /> Download Payslip
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

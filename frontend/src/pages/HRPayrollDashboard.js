import React, { useEffect, useState } from "react";
import PayrollTrendChart from "../components/PayrollTrendChart";

export default function HRPayrollDashboard() {
  const [summary, setSummary] = useState({ totalEmployees: 0, totalAmount: 0, status: "Draft" });
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/hr/payroll/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSummary(data.summary);
      setTrend(data.trend);
    };
    fetchSummary();
  }, []);

  return (
    <div className="p-8 pt-16 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Payroll Dashboard (HR)</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2>Total Employees</h2>
          <p className="text-2xl font-bold">{summary.totalEmployees}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2>Total Amount</h2>
          <p className="text-2xl font-bold">₹{summary.totalAmount}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2>Status</h2>
          <p className="text-xl font-bold">{summary.status}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">📊 Payroll Trend</h2>
      <PayrollTrendChart data={trend} />
    </div>
  );
}

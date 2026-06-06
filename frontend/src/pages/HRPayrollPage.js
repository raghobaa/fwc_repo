import React, { useEffect, useState } from "react";

export default function HRPayrollPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [status, setStatus] = useState("Draft");
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [baseSalary, setBaseSalary] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [deduction, setDeduction] = useState(0);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const years = ["2023", "2024", "2025", "2026"];

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    const token = localStorage.getItem("token");
    const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const res = await fetch(`${BASE}/api/hr/payroll`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setPayrolls(data);
  };

  const generatePayroll = async () => {
    if (!selectedMonth || !selectedYear) {
      alert("Please select payroll month and year.");
      return;
    }

    const token = localStorage.getItem("token");
    const body = {
      month: `${selectedMonth} ${selectedYear}`,
      baseSalary: Number(baseSalary),
      allowance: Number(allowance),
      deduction: Number(deduction),
    };

    const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const res = await fetch(`${BASE}/api/hr/payroll/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setStatus("Approved");
      setShowModal(false);
      fetchPayroll();
      alert("Payroll generated successfully");
    } else {
      alert("Failed to generate payroll");
    }
  };

  const releasePayroll = async () => {
    const token = localStorage.getItem("token");
    const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const res = await fetch(`${BASE}/api/hr/payroll/release`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setStatus("Released");
      alert("Payroll released. Employees can now view payslips.");
    } else {
      alert("Failed to release payroll");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8 pt-20 text-gray-800 font-inter">
      <div className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
        <div className="flex gap-3 items-center">
          <span
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border ${
              status === "Released"
                ? "bg-green-100 text-green-700 border-green-300"
                : status === "Approved"
                ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
          >
            {status}
          </span>

          {status === "Draft" && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#1E3A8A] hover:bg-[#1a3578] text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
            >
              Generate Payroll
            </button>
          )}
          {status === "Approved" && (
            <button
              onClick={releasePayroll}
              className="bg-[#1E3A8A] hover:bg-[#1a3578] text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
            >
              Approve & Release
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto max-w-5xl mx-auto">
        <table className="w-full text-left border border-gray-300 bg-white shadow rounded-xl">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Employee</th>
              <th className="p-3">Month</th>
              <th className="p-3">Basic</th>
              <th className="p-3">Allowance</th>
              <th className="p-3">Deduction</th>
              <th className="p-3">Net Pay</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map((p) => (
              <tr key={p._id} className="border-t border-gray-200">
                <td className="p-3">{p.employeeId?.name}</td>
                <td className="p-3">{p.month}</td>
                <td className="p-3">₹{p.baseSalary}</td>
                <td className="p-3">₹{p.bonus}</td>
                <td className="p-3">₹{p.deductions}</td>
                <td className="p-3 text-green-600 font-semibold">₹{p.netPay}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white text-black p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Generate Payroll</h2>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2 mb-3 border rounded"
            >
              <option value="">Select Month</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2 mb-3 border rounded"
            >
              <option value="">Select Year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
              placeholder="Enter Base Salary"
              className="p-2 rounded w-full mb-3 border"
            />

            <input
              type="number"
              value={allowance}
              onChange={(e) => setAllowance(e.target.value)}
              placeholder="Enter Allowance"
              className="p-2 rounded w-full mb-3 border"
            />

            <input
              type="number"
              value={deduction}
              onChange={(e) => setDeduction(e.target.value)}
              placeholder="Enter Deductions"
              className="p-2 rounded w-full mb-3 border"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={generatePayroll}
                className="bg-[#1E3A8A] hover:bg-[#1a3578] text-white px-5 py-2 rounded-lg font-medium transition shadow-sm"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

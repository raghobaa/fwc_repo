import React, { useEffect, useState } from "react";
import PayrollSlip from "../components/PayrollSlip";
import { generatePayslipPDF } from "../utils/pdfGenerator"; // ✅ keep your file name

export default function EmployeePayrollPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [filteredPayrolls, setFilteredPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    const fetchPayroll = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const res = await fetch(`${BASE}/api/hr/payroll/employee`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setPayrolls(data);
          setFilteredPayrolls(data);
        } else {
          console.error("Failed to fetch payroll data:", res.statusText);
        }
      } catch (err) {
        console.error("Error fetching payroll data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, []);

  const handleFilter = () => {
    let result = payrolls;
    if (selectedMonth) {
      result = result.filter((p) => p.month?.split(" ")[0] === selectedMonth);
    }
    if (selectedYear) {
      result = result.filter((p) => p.month?.split(" ")[1] === selectedYear);
    }
    setFilteredPayrolls(result);
  };

  const clearFilter = () => {
    setSelectedMonth("");
    setSelectedYear("");
    setFilteredPayrolls(payrolls);
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = ["2023", "2024", "2025", "2026"];

  return (
    <div className="bg-gray-100 min-h-screen p-8 pt-20 text-gray-800 font-inter">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 tracking-tight text-center">
          My Payroll
        </h1>

        {/* 🧭 Filters Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 flex flex-wrap gap-4 justify-center sm:justify-between items-center">
          <div className="flex gap-4 flex-wrap">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Month</option>
              {months.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Year</option>
              {years.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleFilter}
              className="bg-[#1E3A8A] hover:bg-[#162c6a] text-white px-4 py-2 rounded-lg font-medium transition shadow-sm hover:shadow-md"
            >
              Apply Filter
            </button>
            <button
              onClick={clearFilter}
              className="border border-gray-400 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* 📊 Payroll Display Section */}
        {loading ? (
          <p className="text-center text-gray-500">Loading payroll data...</p>
        ) : filteredPayrolls.length === 0 ? (
          <p className="text-center text-gray-500">No payroll records found.</p>
        ) : (
          <div className="space-y-5">
            {filteredPayrolls.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
              >
                <PayrollSlip payroll={p} />
                <div className="text-right mt-4">
                  <button
                    onClick={() => generatePayslipPDF(p)}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition shadow-sm hover:shadow-md"
                  >
                    Download Payslip (PDF)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

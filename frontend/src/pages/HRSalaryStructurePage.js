import React, { useEffect, useState } from "react";

export default function HRSalaryStructurePage() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      const token = localStorage.getItem("token");
      const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await fetch(`${BASE}/api/hr/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEmployees(data);
    };
    fetchEmployees();
  }, []);

  const updateSalary = async (id, base, allowance, deduction) => {
    const token = localStorage.getItem("token");
    const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
    await fetch(`${BASE}/api/hr/salary-structure`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ employeeId: id, base, allowance, deduction }),
    });
    alert("✅ Salary structure saved!");
  };

  return (
    <div className="p-8 pt-16 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Employee Salary Structure</h1>
      <table className="w-full text-left border border-gray-700">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-2">Employee</th>
            <th className="p-2">Base Salary</th>
            <th className="p-2">Allowance</th>
            <th className="p-2">Deduction</th>
            <th className="p-2">Save</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp._id} className="border-t border-gray-700">
              <td className="p-2">{emp.name}</td>
              <td className="p-2">
                <input type="number" onChange={(e) => emp.base = e.target.value} className="text-black p-1 rounded" />
              </td>
              <td className="p-2">
                <input type="number" onChange={(e) => emp.allowance = e.target.value} className="text-black p-1 rounded" />
              </td>
              <td className="p-2">
                <input type="number" onChange={(e) => emp.deduction = e.target.value} className="text-black p-1 rounded" />
              </td>
              <td className="p-2">
                <button
                  onClick={() => updateSalary(emp._id, emp.base, emp.allowance, emp.deduction)}
                  className="bg-blue-600 px-3 py-1 rounded"
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

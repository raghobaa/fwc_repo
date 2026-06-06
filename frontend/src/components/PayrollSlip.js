import React from "react";

export default function PayrollSlip({ payroll }) {
  return (
    <div className="bg-white text-black p-6 rounded-md shadow-md w-full max-w-md mx-auto my-4">
      <h2 className="text-xl font-bold mb-4 text-center">Company Name Pvt. Ltd.</h2>
      <p><strong>Employee Name:</strong> {payroll.employeeId?.name}</p>
      <p><strong>Month:</strong> {payroll.month}</p>
      <p><strong>Base Salary:</strong> ₹{payroll.baseSalary}</p>
      <p><strong>Bonus:</strong> ₹{payroll.bonus}</p>
      <p><strong>Deductions:</strong> ₹{payroll.deductions}</p>
      <hr className="my-2" />
      <p className="text-lg font-semibold text-green-600">
        Net Pay: ₹{payroll.netPay}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Generated on {new Date(payroll.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

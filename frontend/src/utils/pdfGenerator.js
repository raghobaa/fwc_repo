import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePayslipPDF = (payroll) => {
  const doc = new jsPDF();

  // ✅ Sanitize & fallback values properly
  const employeeName = (payroll?.employeeId?.name || "N/A").replace(/[^a-zA-Z0-9\s]/g, "");
  const base = Number(payroll?.baseSalary) || 0;
  const bonus = Number(payroll?.bonus) || 0;
  const deductions = Number(payroll?.deductions) || 0;
  const net = Number(payroll?.netPay) || base + bonus - deductions;
  const month = payroll?.month || "Unknown";
  const generatedDate = payroll?.createdAt
    ? new Date(payroll.createdAt).toLocaleDateString()
    : new Date().toLocaleDateString();

  // 🏢 Header
  doc.setFontSize(18);
  doc.text("Company Name Pvt. Ltd.", 14, 20);
  doc.setFontSize(12);
  doc.text(`Payslip for ${month}`, 14, 30);

  // 🧾 Table
  autoTable(doc, {
    startY: 40,
    head: [["Field", "Value"]],
    body: [
      ["Employee Name", employeeName],
      ["Base Salary", `₹${base.toLocaleString("en-IN")}`],
      ["Bonus", `₹${bonus.toLocaleString("en-IN")}`],
      ["Deductions", `₹${deductions.toLocaleString("en-IN")}`],
      ["Net Pay", `₹${net.toLocaleString("en-IN")}`],
      ["Generated On", generatedDate],
    ],
    theme: "grid",
    headStyles: { fillColor: [0, 166, 81] },
    styles: { fontSize: 12 },
  });

  // 💾 Clean filename
  const safeFileName = `Payslip_${employeeName || "Employee"}_${month}`.replace(/\s+/g, "_");
  doc.save(`${safeFileName}.pdf`);
};

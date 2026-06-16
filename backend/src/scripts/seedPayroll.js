// Seed payroll data for demo — run with: node src/scripts/seedPayroll.js (from backend/ folder)
import "../config/env.js";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Payroll from "../models/Payroll.js";

const MONTHS = [
  { label: "February 2026", base: 55000, bonus: 5000, deductions: 3500 },
  { label: "March 2026",    base: 55000, bonus: 3000, deductions: 3500 },
  { label: "April 2026",    base: 55000, bonus: 7000, deductions: 3500 },
  { label: "May 2026",      base: 55000, bonus: 4500, deductions: 3500 },
  { label: "June 2026",     base: 55000, bonus: 2000, deductions: 3500 },
];

const run = async () => {
  await connectDB();

  const employees = await User.find({ role: "Employee" });
  if (!employees.length) {
    console.error("No Employee users found — aborting.");
    await mongoose.disconnect();
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const emp of employees) {
    for (const m of MONTHS) {
      const existing = await Payroll.findOne({ employeeId: emp._id, month: m.label });
      if (existing) { skipped++; continue; }

      const netPay = m.base + m.bonus - m.deductions;
      await Payroll.create({
        employeeId: emp._id,
        baseSalary: m.base,
        bonus: m.bonus,
        deductions: m.deductions,
        netPay,
        month: m.label,
        status: "Released",
      });
      created++;
      console.log(`  Created: ${emp.name} — ${m.label} — Net ₹${netPay}`);
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped (already existed): ${skipped}`);
  await mongoose.disconnect();
};

run().catch(err => { console.error(err); process.exit(1); });

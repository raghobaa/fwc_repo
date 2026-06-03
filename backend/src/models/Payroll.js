import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  baseSalary: { type: Number, required: true },
  bonus: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netPay: { type: Number, required: true },
  month: { type: String, required: true },
  status: { type: String, enum: ["Draft", "Approved", "Released"], default: "Draft" },
}, { timestamps: true });

export default mongoose.model("Payroll", payrollSchema);

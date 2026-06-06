import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";
import Payroll from "../models/Payroll.js";

const router = express.Router();

/*  Fetch all payroll records (HR/Admin) */
router.get("/", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 });

    res.json(payrolls);
  } catch (error) {
    console.error("Payroll fetch error:", error);
    res.status(500).json({ error: "Failed to fetch payroll records" });
  }
});

/* Generate payroll dynamically */
router.post("/generate", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  
  try {
    let { month, baseSalary, allowance, deduction } = req.body;

    //  Validation
    if (!month || typeof month !== "string" || month.trim().length === 0) {
      return res.status(400).json({ message: "Month is required" });
    }

    baseSalary = Number(baseSalary);
    allowance = Number(allowance);
    deduction = Number(deduction);

    if (isNaN(baseSalary) || isNaN(allowance) || isNaN(deduction)) {
      return res.status(400).json({ message: "Invalid salary inputs" });
    }

    const existing = await Payroll.findOne({ month });
    if (existing) {
      return res.status(400).json({ message: `Payroll for ${month} already exists` });
    }

    const employees = await User.find({ role: "Employee" });
    if (employees.length === 0) {
      return res.status(400).json({ message: "No employees found" });
    }

    const generatedPayrolls = [];

    for (let emp of employees) {
      const finalBase = baseSalary || 30000;
      const finalBonus = allowance;
      const finalDeductions = deduction;
      const netPay = finalBase + finalBonus - finalDeductions;

      const payroll = await Payroll.create({
        employeeId: emp._id,
        baseSalary: finalBase,
        bonus: finalBonus,
        deductions: finalDeductions,
        netPay,
        month,
        status: "Approved",
      });

      generatedPayrolls.push(payroll);
    }

    res.json({ message: `✅ Payroll generated for ${month}`, payrolls: generatedPayrolls });
  } catch (error) {
    console.error("Payroll generation error:", error);
    res.status(500).json({ error: "Failed to generate payroll" });
  }
});

/*  Release payroll */
router.patch("/release", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    await Payroll.updateMany({}, { status: "Released" });
    res.json({ message: "✅ Payroll released successfully" });
  } catch (error) {
    console.error("Payroll release error:", error);
    res.status(500).json({ error: "Failed to release payroll" });
  }
});

/* Employee-specific payroll */
router.get("/employee", protect, authorizeRoles("Employee"), async (req, res) => {
  try {
    const employeeId = req.user._id;
    const records = await Payroll.find({ employeeId, status: "Released" }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    console.error("Employee payroll fetch error:", error);
    res.status(500).json({ error: "Failed to fetch employee payroll" });
  }
});

export default router;

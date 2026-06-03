import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import Attendance from "../models/Attendance.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Payroll from "../models/Payroll.js";
import User from "../models/User.js";
import Feedback from "../models/Feedback.js";

const router = express.Router();

/* Get All Attendance - HR */
router.get("/attendance", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const employees = await User.find({ role: "Employee" }).select("name email");
    const attendanceRecords = await Attendance.find();

    const result = employees.map((emp) => {
      const empRecords = attendanceRecords.filter(
        (r) => r.employeeId.toString() === emp._id.toString()
      );
      return {
        _id: emp._id,
        name: emp.name,
        email: emp.email,
        totalAttendance: empRecords.length,
        dates: empRecords.map((r) => r.date),
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Attendance fetch error:", error);
    res.status(500).json({ message: "Failed to fetch attendance records" });
  }
});

/* Get All Leave Requests - HR */
router.get("/leave", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const requests = await LeaveRequest.find()
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Leave fetch error:", error);
    res.status(500).json({ message: "Failed to fetch leave requests" });
  }
});

/* Approve / Reject Leave Request - HR */
router.patch("/leave/:id", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.json({ message: `✅ Leave ${status.toLowerCase()} successfully`, updated });
  } catch (error) {
    console.error("Leave update error:", error);
    res.status(500).json({ message: "Failed to update leave request" });
  }
});

/* Employee Fetch for HR (Simplified) */
router.get("/employees", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const employees = await User.find({ role: "Employee" }).select("name email");
    res.json(employees);
  } catch (error) {
    console.error("Employee fetch error:", error);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
});

/* Payroll - Create (Single Employee) */
router.post("/payroll", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const { employeeId, baseSalary, bonus, deductions, month } = req.body;
    const netPay = baseSalary + bonus - deductions;

    const payroll = await Payroll.create({
      employeeId,
      baseSalary,
      bonus,
      deductions,
      netPay,
      month,
    });

    res.json(payroll);
  } catch (error) {
    console.error("Payroll creation error:", error);
    res.status(500).json({ message: "Failed to create payroll" });
  }
});

/* Payroll - Generate (Bulk for all employees) */
router.post("/payroll/generate", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    let { month, baseSalary, allowance, deduction } = req.body;

    // Input validation
    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    // Convert to proper numbers
    baseSalary = Number(baseSalary);
    allowance = Number(allowance);
    deduction = Number(deduction);

    if (isNaN(baseSalary) || isNaN(allowance) || isNaN(deduction)) {
      return res.status(400).json({ message: "Invalid salary inputs" });
    }

    //  Check if payroll already exists for this month
    const existing = await Payroll.findOne({ month });
    if (existing) {
      return res.status(400).json({ message: `Payroll for ${month} already exists` });
    }

    //  Get all employees
    const employees = await User.find({ role: "Employee" });
    if (employees.length === 0) {
      return res.status(400).json({ message: "No employees found" });
    }

    const generatedPayrolls = [];

    //  Generate payrolls properly
    for (const emp of employees) {
      const finalBase = baseSalary;
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

/* Payroll - Get All */
router.get("/payroll", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const records = await Payroll.find().populate("employeeId", "name email");
    res.json(records);
  } catch (error) {
    console.error("Payroll fetch error:", error);
    res.status(500).json({ message: "Failed to fetch payroll records" });
  }
});

/*  Get All Feedback (HR) */
router.get("/feedback", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    console.error("Feedback fetch error:", err);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

export default router;

/* =========================
   Onboarding Management
   ========================= */
//  Fetch candidates for onboarding
router.get(
  "/onboarding",
  protect,
  authorizeRoles("HR", "Admin"),
  async (req, res) => {
    try {
      const candidates = await User.find({ role: "Candidate" }).select(
        "name email onboardingStatus"
      );
      res.json(candidates);
    } catch (err) {
      console.error("Onboarding list error:", err);
      res.status(500).json({ message: "Failed to fetch onboarding list" });
    }
  }
);

// Start onboarding for a candidate
router.post(
  "/onboarding/:id/trigger",
  protect,
  authorizeRoles("HR", "Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await User.findByIdAndUpdate(
        id,
        { onboardingStatus: "In Progress" },
        { new: true }
      ).select("name email onboardingStatus");
      if (!updated) return res.status(404).json({ message: "Candidate not found" });
      res.json({ message: "Onboarding started", candidate: updated });
    } catch (err) {
      console.error("Onboarding trigger error:", err);
      res.status(500).json({ message: "Failed to start onboarding" });
    }
  }
);

// Withdraw onboarding back to Pending
router.post(
  "/onboarding/:id/withdraw",
  protect,
  authorizeRoles("HR", "Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await User.findByIdAndUpdate(
        id,
        { onboardingStatus: "Pending" },
        { new: true }
      ).select("name email onboardingStatus");
      if (!updated) return res.status(404).json({ message: "Candidate not found" });
      res.json({ message: "Onboarding withdrawn", candidate: updated });
    } catch (err) {
      console.error("Onboarding withdraw error:", err);
      res.status(500).json({ message: "Failed to withdraw onboarding" });
    }
  }
);

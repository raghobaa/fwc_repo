import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import Attendance from "../models/Attendance.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Feedback from "../models/Feedback.js";
import Payroll from "../models/Payroll.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import Task from "../models/Task.js";

const MAX_LEAVE_DAYS = 20;

const router = express.Router();

/* Employee Profile */
router.get("/profile", protect, authorizeRoles("Employee"), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

/* Dashboard Stats */
router.get("/dashboard-stats", protect, authorizeRoles("Employee"), async (req, res) => {
  try {
    const userId = req.user._id;

    // Current month window for attendance rate
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [ongoingProjects, pendingTasks, presentThisMonth, approvedLeaves] = await Promise.all([
      Project.countDocuments({ assignedTo: userId, status: { $in: ["active", "Active", "ongoing", "Ongoing"] } }),
      Task.countDocuments({ assignedTo: userId, status: { $in: ["pending", "in-progress"] } }),
      Attendance.countDocuments({ employeeId: userId, status: "Present", date: { $gte: monthStart, $lte: today } }),
      LeaveRequest.countDocuments({ employeeId: userId, status: "Approved" }),
    ]);

    const daysElapsed = now.getDate(); // days into current month
    const attendancePercentage = daysElapsed ? Math.round((presentThisMonth / daysElapsed) * 100) : 0;
    const leaveBalance = Math.max(0, MAX_LEAVE_DAYS - approvedLeaves);

    res.json({ ongoingProjects, pendingTasks, attendancePercentage, leaveBalance });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

/* Get Attendance History + today's status */
router.get("/attendance", protect, authorizeRoles("Employee"), async (req, res) => {
  try {
    const employeeId = req.user._id;

    // Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Current month range
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [markedToday, monthRecords, totalRecords] = await Promise.all([
      Attendance.findOne({ employeeId, date: today }),
      Attendance.find({ employeeId, date: { $gte: monthStart, $lte: monthEnd } }).sort({ date: 1 }),
      Attendance.countDocuments({ employeeId }),
    ]);

    const presentThisMonth = monthRecords.filter(r => r.status === "Present").length;
    const workingDaysThisMonth = today.getDate(); // days elapsed in month
    const attendancePct = workingDaysThisMonth
      ? Math.round((presentThisMonth / workingDaysThisMonth) * 100)
      : 0;

    res.json({
      markedToday: !!markedToday,
      todayStatus: markedToday?.status || null,
      presentThisMonth,
      absentThisMonth: workingDaysThisMonth - presentThisMonth,
      workingDaysThisMonth,
      attendancePct,
      totalPresent: totalRecords,
      records: monthRecords,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
});

/* Mark Attendance */
router.post("/attendance", protect, authorizeRoles("Employee"), async (req, res) => {
  try {
    const employeeId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyMarked = await Attendance.findOne({ employeeId, date: today });
    if (alreadyMarked) {
      return res.status(400).json({ message: "Already marked for today" });
    }

    const attendance = await Attendance.create({ employeeId, date: today, status: "Present" });
    res.json({ message: "Attendance marked", attendance });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark attendance" });
  }
});

/* Submit Leave Request */
router.post("/leave", protect, authorizeRoles("Employee"), async (req, res) => {
  try {
    let { startDate, endDate, reason } = req.body;
    const employeeId = req.user._id;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: "startDate, endDate and reason are required" });
    }

    // Normalize and validate dates
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
      return res.status(400).json({ message: "Invalid startDate or endDate" });
    }
    if (e < s) {
      return res.status(400).json({ message: "endDate cannot be before startDate" });
    }

    // Optional: same-day leaves ok; strip time for consistency if needed
    const leave = await LeaveRequest.create({
      employeeId,
      startDate: s,
      endDate: e,
      reason: String(reason).trim(),
      status: "Pending",
    });

    res.json({ message: "✅ Leave submitted successfully", leave });
  } catch (err) {
    console.error("Leave submit error:", err);
    res.status(500).json({ message: "Failed to submit leave request" });
  }
});

/*  Get Leave History for Employee */
router.get("/leave", protect, authorizeRoles("Employee"), async (req, res) => {
  try {
    const employeeId = req.user._id;
    const history = await LeaveRequest.find({ employeeId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch leave history" });
  }
});

/*  Submit Feedback */
router.post("/feedback", protect, authorizeRoles("Employee"), async (req, res) => {
  try {
    const { message, rating } = req.body;
    const employeeId = req.user._id;

    const feedback = await Feedback.create({ employeeId, message, rating });
    res.json({ message: "✅ Feedback submitted successfully", feedback });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit feedback" });
  }
});

/* Get Payroll for Logged-in Employee  */
router.get("/payroll", protect, authorizeRoles("Employee"), async (req, res) => {
  try {
    const employeeId = req.user._id;
    const payroll = await Payroll.find({ employeeId }).sort({ createdAt: -1 });

    if (!payroll.length) {
      return res.status(404).json({ message: "No payroll found for this employee" });
    }

    res.json(payroll);
  } catch (err) {
    console.error("Employee payroll fetch error:", err);
    res.status(500).json({ message: "Failed to fetch payroll" });
  }
});

/* Promotion Eligibility */
router.get("/promotion-eligibility", protect, authorizeRoles("Employee"), async (req, res) => {
  try {
    const userId = req.user._id;

    const [attendanceCount, totalDays, approvedLeaves, pendingLeaves] = await Promise.all([
      Attendance.countDocuments({ employeeId: userId, status: "Present" }),
      Attendance.countDocuments({ employeeId: userId }),
      LeaveRequest.countDocuments({ employeeId: userId, status: "Approved" }),
      LeaveRequest.countDocuments({ employeeId: userId, status: "Pending" }),
    ]);

    const attendancePct = totalDays ? Math.round((attendanceCount / totalDays) * 100) : 0;
    const activeProjects = await Project.countDocuments({ assignedTo: userId, status: "Active" });
    const completedProjects = await Project.countDocuments({ assignedTo: userId, status: "Completed" });

    const criteria = [
      { label: "Attendance Rate", current: `${attendancePct}%`, target: "85%", met: attendancePct >= 85 },
      { label: "Completed Projects", current: completedProjects, target: 3, met: completedProjects >= 3 },
      { label: "Approved Leaves Within Limit", current: approvedLeaves, target: "≤ 10", met: approvedLeaves <= 10 },
      { label: "Active Projects", current: activeProjects, target: "≥ 1", met: activeProjects >= 1 },
    ];

    const metCount = criteria.filter(c => c.met).length;
    const eligible = metCount === criteria.length;
    const score = Math.round((metCount / criteria.length) * 100);

    res.json({ eligible, score, metCount, totalCriteria: criteria.length, criteria, attendancePct, completedProjects, activeProjects });
  } catch (err) {
    console.error("Promotion eligibility error:", err);
    res.status(500).json({ message: "Failed to fetch promotion eligibility" });
  }
});

export default router;

import express from "express";
import User from "../models/User.js";
import Job from "../models/Job.js";
import ActivityLog from "../models/ActivityLog.js";
import Department from "../models/Department.js";
import Announcement from "../models/Announcement.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { logActivity } from "../utils/logActivity.js";

const router = express.Router();
const ALLOWED_ROLES = ["Admin", "HR", "Employee", "Candidate"];

/* ─────────────────────────────────────────────────────────────
   USER MANAGEMENT
───────────────────────────────────────────────────────────── */

router.get("/users", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.post("/users", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "Name, email, password and role are required" });
    if (!ALLOWED_ROLES.includes(role))
      return res.status(400).json({ message: "Invalid role" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already in use" });

    const user = await User.create({ name, email, password, role });
    await logActivity({
      activityType: "USER_CREATED",
      performedBy: req.user.name,
      performedByRole: req.user.role,
      description: `${req.user.name} created a new ${role} account for ${name} (${email})`,
    });
    res.status(201).json({
      message: `${role} account created`,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Admin create user error:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
});

router.patch("/users/:id", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const { role, name } = req.body;
    if (role && !ALLOWED_ROLES.includes(role))
      return res.status(400).json({ message: "Invalid role" });
    if (req.params.id === req.user._id.toString() && role && role !== "Admin")
      return res.status(400).json({ message: "Cannot change your own role" });

    const updates = {};
    if (role) updates.role = role;
    if (name) updates.name = name;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (role) {
      await logActivity({
        activityType: "USER_ROLE_CHANGED",
        performedBy: req.user.name,
        performedByRole: req.user.role,
        description: `${req.user.name} changed ${user.name}'s role to ${role}`,
      });
    }
    res.json({ message: "User updated", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user" });
  }
});

router.delete("/users/:id", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: "Cannot delete your own account" });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await logActivity({
      activityType: "USER_DELETED",
      performedBy: req.user.name,
      performedByRole: req.user.role,
      description: `${req.user.name} deleted user ${user.name} (${user.email})`,
    });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

/* ─────────────────────────────────────────────────────────────
   FEATURE 1 — SYSTEM STATS
───────────────────────────────────────────────────────────── */

router.get("/stats", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const [employees, hrUsers, candidates, openJobs, departments, announcements] = await Promise.all([
      User.countDocuments({ role: "Employee" }),
      User.countDocuments({ role: "HR" }),
      User.countDocuments({ role: "Candidate" }),
      Job.countDocuments(),
      Department.countDocuments(),
      Announcement.countDocuments({
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      }),
    ]);
    res.json({ employees, hrUsers, candidates, openJobs, departments, announcements });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

/* ─────────────────────────────────────────────────────────────
   FEATURE 2 — ACTIVITY LOG
───────────────────────────────────────────────────────────── */

router.get("/activity", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(20);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch activity logs" });
  }
});

/* ─────────────────────────────────────────────────────────────
   FEATURE 3 — DEPARTMENT MANAGEMENT
───────────────────────────────────────────────────────────── */

router.get("/departments", protect, authorizeRoles("Admin", "HR"), async (req, res) => {
  try {
    const departments = await Department.find()
      .populate("head", "name email")
      .sort({ createdAt: -1 });

    const withCount = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await User.countDocuments({ role: "Employee", department: dept.name });
        return { ...dept.toObject(), employeeCount };
      })
    );
    res.json(withCount);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch departments" });
  }
});

router.post("/departments", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const { name, description, head } = req.body;
    if (!name) return res.status(400).json({ message: "Department name is required" });

    const exists = await Department.findOne({ name: name.trim() });
    if (exists) return res.status(400).json({ message: "Department already exists" });

    const dept = await Department.create({ name: name.trim(), description, head: head || null });
    const populated = await dept.populate("head", "name email");

    await logActivity({
      activityType: "DEPARTMENT_CREATED",
      performedBy: req.user.name,
      performedByRole: req.user.role,
      description: `${req.user.name} created department "${name}"`,
    });
    res.status(201).json({ message: "Department created", department: populated });
  } catch (err) {
    console.error("Dept create error:", err);
    res.status(500).json({ message: "Failed to create department" });
  }
});

router.patch("/departments/:id", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const { name, description, head } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description;
    if (head !== undefined) updates.head = head || null;

    const dept = await Department.findByIdAndUpdate(req.params.id, updates, { new: true }).populate("head", "name email");
    if (!dept) return res.status(404).json({ message: "Department not found" });

    await logActivity({
      activityType: "DEPARTMENT_UPDATED",
      performedBy: req.user.name,
      performedByRole: req.user.role,
      description: `${req.user.name} updated department "${dept.name}"`,
    });
    res.json({ message: "Department updated", department: dept });
  } catch (err) {
    res.status(500).json({ message: "Failed to update department" });
  }
});

router.delete("/departments/:id", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    await logActivity({
      activityType: "DEPARTMENT_DELETED",
      performedBy: req.user.name,
      performedByRole: req.user.role,
      description: `${req.user.name} deleted department "${dept.name}"`,
    });
    res.json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete department" });
  }
});

/* ─────────────────────────────────────────────────────────────
   FEATURE 4 — ANNOUNCEMENTS
───────────────────────────────────────────────────────────── */

// Public-ish: all authenticated roles can view active announcements
router.get("/announcements", protect, async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    })
      .populate("createdBy", "name role")
      .sort({ isPinned: -1, createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
});

router.post("/announcements", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const { title, description, priority, isPinned, expiresAt } = req.body;
    if (!title || !description)
      return res.status(400).json({ message: "Title and description are required" });

    const ann = await Announcement.create({
      title,
      description,
      priority: priority || "Medium",
      isPinned: isPinned || false,
      expiresAt: expiresAt || null,
      createdBy: req.user._id,
    });
    const populated = await ann.populate("createdBy", "name role");

    await logActivity({
      activityType: "ANNOUNCEMENT_CREATED",
      performedBy: req.user.name,
      performedByRole: req.user.role,
      description: `${req.user.name} posted announcement: "${title}"`,
    });
    res.status(201).json({ message: "Announcement created", announcement: populated });
  } catch (err) {
    res.status(500).json({ message: "Failed to create announcement" });
  }
});

router.patch("/announcements/:id", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const { title, description, priority, isPinned, expiresAt } = req.body;
    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (priority) updates.priority = priority;
    if (isPinned !== undefined) updates.isPinned = isPinned;
    if (expiresAt !== undefined) updates.expiresAt = expiresAt || null;

    const ann = await Announcement.findByIdAndUpdate(req.params.id, updates, { new: true }).populate("createdBy", "name role");
    if (!ann) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement updated", announcement: ann });
  } catch (err) {
    res.status(500).json({ message: "Failed to update announcement" });
  }
});

router.delete("/announcements/:id", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndDelete(req.params.id);
    if (!ann) return res.status(404).json({ message: "Announcement not found" });

    await logActivity({
      activityType: "ANNOUNCEMENT_DELETED",
      performedBy: req.user.name,
      performedByRole: req.user.role,
      description: `${req.user.name} deleted announcement: "${ann.title}"`,
    });
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete announcement" });
  }
});

export default router;

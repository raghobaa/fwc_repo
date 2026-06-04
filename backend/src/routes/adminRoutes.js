import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

const ALLOWED_ROLES = ["Admin", "HR", "Employee", "Candidate"];

/* GET /api/admin/users — list all users */
router.get("/users", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* POST /api/admin/users — Admin creates a user with any role */
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
    res.status(201).json({
      message: `${role} account created`,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Admin create user error:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
});

/* PATCH /api/admin/users/:id — Admin updates role or name */
router.patch("/users/:id", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const { role, name } = req.body;

    if (role && !ALLOWED_ROLES.includes(role))
      return res.status(400).json({ message: "Invalid role" });

    // Prevent demoting yourself
    if (req.params.id === req.user._id.toString() && role && role !== "Admin")
      return res.status(400).json({ message: "Cannot change your own role" });

    const updates = {};
    if (role) updates.role = role;
    if (name) updates.name = name;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user" });
  }
});

/* DELETE /api/admin/users/:id — Admin deletes a user */
router.delete("/users/:id", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: "Cannot delete your own account" });

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;

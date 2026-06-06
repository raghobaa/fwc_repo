import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import Project from "../models/Project.js";

const router = express.Router();

/* HR - Create New Project */
router.post("/", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const { title, description, deadline } = req.body;

    if (!title || !description || !deadline) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const project = await Project.create({
      title,
      description,
      deadline,
      status: "Active",
    });

    res.status(201).json({ message: "✅ Project created successfully", project });
  } catch (error) {
    console.error("Project create error:", error);
    res.status(500).json({ message: "Failed to create project" });
  }
});

/* HR - Get All Projects (Past + Active) */
router.get("/", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error("Project fetch error:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

/* HR - Update Project Status (Active / Completed) */
router.patch("/:id", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Active", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "✅ Project status updated", project: updated });
  } catch (error) {
    console.error("Project update error:", error);
    res.status(500).json({ message: "Failed to update project status" });
  }
});

/* Employee - Get All Projects (Only View) */
router.get("/employee", protect, authorizeRoles("Employee"), async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error("Employee project fetch error:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

export default router;

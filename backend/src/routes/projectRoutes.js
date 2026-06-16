import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import Project from "../models/Project.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads/projects")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

const router = express.Router();

/* HR - Create New Project */
router.post("/", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const { title, description, deadline } = req.body;

    if (!title || !description || !deadline) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(deadlineDate.getTime()) || deadlineDate < today) {
      return res.status(400).json({ message: "Project deadline must be today or a future date" });
    }

    const project = await Project.create({
      title,
      description,
      deadline: deadlineDate,
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

/* Employee - Update Project Status */
router.put("/employee/status", protect, authorizeRoles("Employee"), async (req, res) => {
  try {
    const { projectId, status } = req.body;
    const project = await Project.findByIdAndUpdate(projectId, { status }, { new: true });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ project });
  } catch (err) { res.status(500).json({ message: "Failed to update status" }); }
});

/* Employee - Update Project Progress */
router.put("/employee/progress", protect, authorizeRoles("Employee"), async (req, res) => {
  try {
    const { projectId, progress } = req.body;
    const project = await Project.findByIdAndUpdate(projectId, { progress }, { new: true });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ project });
  } catch (err) { res.status(500).json({ message: "Failed to update progress" }); }
});

/* Employee - Post Collaboration Message */
router.post("/employee/collaboration", protect, authorizeRoles("Employee"), async (req, res) => {
  try {
    const { projectId, message } = req.body;
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $push: { collaboration: { sender: req.user._id, senderName: req.user.name, message } } },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ collaboration: project.collaboration });
  } catch (err) { res.status(500).json({ message: "Failed to send message" }); }
});

/* Employee - Upload Document */
router.post("/employee/document", protect, authorizeRoles("Employee"), upload.single("document"), async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $push: { documents: { filename: req.file.filename, originalName: req.file.originalname, uploadedBy: req.user._id } } },
      { new: true }
    );
    res.json({ documents: project.documents });
  } catch (err) { res.status(500).json({ message: "Failed to upload document" }); }
});

/* Employee - Upload Work Report */
router.post("/employee/work-report", protect, authorizeRoles("Employee"), upload.single("workReport"), async (req, res) => {
  try {
    const { projectId, title, weekEnding } = req.body;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $push: { workReports: { title, filename: req.file.filename, originalName: req.file.originalname, weekEnding, uploadedBy: req.user._id } } },
      { new: true }
    );
    res.json({ workReports: project.workReports });
  } catch (err) { res.status(500).json({ message: "Failed to upload work report" }); }
});

export default router;

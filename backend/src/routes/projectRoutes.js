import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import Project from "../models/Project.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/projects/documents';
    if (file.fieldname === 'workReport') folder = 'uploads/projects/reports';
    const fullPath = path.join(__dirname, '../../', folder);
    try {
      fs.mkdirSync(fullPath, { recursive: true });
      cb(null, fullPath);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${unique}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only PDF, DOC, DOCX files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// ---------- HR Endpoints ----------
router.post("/", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const { title, description, deadline, assignedTo } = req.body;
    if (!title || !description || !deadline || !assignedTo) {
      return res.status(400).json({ message: "All fields (title, description, deadline, assignedTo) are required" });
    }
    const project = await Project.create({ title, description, deadline, assignedTo, status: "pending_acceptance" });
    res.status(201).json({ message: "✅ Project created", project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const projects = await Project.find().populate("assignedTo", "name email").sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending_acceptance", "active", "ongoing", "completed", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const updated = await Project.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Status updated", project: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/hr/all", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const projects = await Project.find().populate("assignedTo", "name email").sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- Employee Endpoints ----------
router.get("/employee", protect, authorizeRoles("Employee"), async (req, res) => {
  try {
    const projects = await Project.find({ assignedTo: req.user._id }).sort({ deadline: 1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/employee/status", protect, authorizeRoles("Employee"), async (req, res) => {
  try {
    const { projectId, status } = req.body;
    if (!["active", "ongoing", "completed", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const project = await Project.findOne({ _id: projectId, assignedTo: req.user._id });
    if (!project) return res.status(404).json({ message: "Project not found" });
    project.status = status;
    if (status === "completed") project.progress = 100;
    await project.save();
    res.json({ message: "Status updated", project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/employee/progress", protect, authorizeRoles("Employee"), async (req, res) => {
  try {
    const { projectId, progress } = req.body;
    if (progress < 0 || progress > 100) return res.status(400).json({ message: "Progress must be 0-100" });
    const project = await Project.findOne({ _id: projectId, assignedTo: req.user._id });
    if (!project) return res.status(404).json({ message: "Project not found" });
    project.progress = progress;
    if (progress === 100) project.status = "completed";
    await project.save();
    res.json({ message: "Progress updated", project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/employee/collaboration", protect, authorizeRoles("Employee"), async (req, res) => {
  try {
    const { projectId, message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });
    const project = await Project.findOne({ _id: projectId, assignedTo: req.user._id });
    if (!project) return res.status(404).json({ message: "Project not found" });
    project.collaboration.push({ sender: req.user.name, message, timestamp: new Date() });
    await project.save();
    res.json({ message: "Message added", collaboration: project.collaboration });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Document upload (employee)
router.post("/employee/document", protect, authorizeRoles("Employee"), upload.single("document"), async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const project = await Project.findOne({ _id: projectId, assignedTo: req.user._id });
    if (!project) return res.status(404).json({ message: "Project not found" });
    const filePath = `/uploads/projects/documents/${req.file.filename}`;
    project.documents.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath,
      uploadedBy: req.user.name,
      uploadedAt: new Date()
    });
    await project.save();
    res.json({ message: "Document uploaded", documents: project.documents });
  } catch (error) {
    console.error("Document upload error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Work report upload (employee)
router.post("/employee/work-report", protect, authorizeRoles("Employee"), upload.single("workReport"), async (req, res) => {
  try {
    const { projectId, title, weekEnding } = req.body;
    if (!req.file || !title) return res.status(400).json({ message: "Title and file are required" });
    const project = await Project.findOne({ _id: projectId, assignedTo: req.user._id });
    if (!project) return res.status(404).json({ message: "Project not found" });
    const filePath = `/uploads/projects/reports/${req.file.filename}`;
    project.workReports.push({
      title,
      filename: req.file.filename,
      filePath,
      uploadedBy: req.user.name,
      weekEnding: weekEnding || new Date(),
      uploadedAt: new Date()
    });
    await project.save();
    res.json({ message: "Work report uploaded", workReports: project.workReports });
  } catch (error) {
    console.error("Work report upload error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
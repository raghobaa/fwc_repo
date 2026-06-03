import express from "express";
import Job from "../models/Job.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import JobApplication from "../models/JobApplication.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Multer storage for resumes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/resumes";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// HR/Admin can add jobs
router.post("/", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const { title, description, location } = req.body;
    const job = await Job.create({
      title,
      description,
      location,
      createdBy: req.user._id,
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: "Failed to add job", error: err.message });
  }
});

//  Public - View jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// Candidate can upload resume + name + email
router.post("/:id/apply", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const jobId = req.params.id;
    const { name, email } = req.body;
    const resumePath = req.file.path;

    await JobApplication.create({
      jobId,
      candidateName: name || "Anonymous",
      candidateEmail: email || "N/A",
      resumePath,
    });

    res.status(200).json({ message: "Application submitted successfully", path: resumePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload resume", error: err.message });
  }
});

//  HR can fetch all applications for a job
router.get("/:id/applications", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const applications = await JobApplication.find({ jobId: req.params.id }).sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

export default router;

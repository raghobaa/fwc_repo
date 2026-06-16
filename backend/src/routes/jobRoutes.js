import express from "express";
import Job from "../models/Job.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
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

const optionalProtect = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next();

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
  } catch (err) {
    console.error("Optional auth ignored for job application:", err.message);
  }

  next();
};

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

const handleApply = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const jobId = req.body.jobId || req.params.id;
    if (!jobId) return res.status(400).json({ message: "Job ID is required" });

    const { name, email, phone, coverLetter } = req.body;
    const resumePath = req.file.path;

    // Read the resume file as binary buffer to store in DB
    let resumeBuffer;
    try {
      resumeBuffer = fs.readFileSync(resumePath);
    } catch (readErr) {
      console.error("Failed to read uploaded resume file:", readErr);
    }

    const application = await JobApplication.create({
      jobId,
      candidateId: req.user?._id || undefined,
      candidateName: name || "Anonymous",
      candidateEmail: email || "N/A",
      candidatePhone: phone || "",
      coverLetter: coverLetter || "",
      resumePath,
      resumeBuffer,
      resumeFilename: req.file.originalname,
      resumeMimetype: req.file.mimetype,
    });

    // Also push to the Job's applications array
    try {
      await Job.findByIdAndUpdate(jobId, {
        $push: {
          applications: {
            name: name || "Anonymous",
            email: email || "N/A",
            resumePath,
          }
        }
      });
    } catch (jobErr) {
      console.error("Failed to push application to Job document:", jobErr);
    }

    // Send resume to new_ai service for embedding (fire-and-forget)
    try {
      const NEW_AI_URL = process.env.NEW_AI_URL || "http://localhost:5009";
      const form = new FormData();
      form.append("files", fs.createReadStream(resumePath), req.file.originalname);
      axios.post(`${NEW_AI_URL}/api/upload`, form, { headers: form.getHeaders(), timeout: 30000 })
        .catch(e => console.error("Embedding service error:", e.message));
    } catch (e) {
      console.error("Failed to send resume for embedding:", e.message);
    }

    res.status(200).json({ message: "Application submitted successfully", path: resumePath, application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload resume", error: err.message });
  }
};

router.post("/apply", optionalProtect, upload.single("resume"), handleApply);

//  HR can fetch all applications for a job
// HR can fetch all job applications (for scheduling)
router.get("/applications", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const applications = await JobApplication.find()
      .populate("jobId", "title") // include job title for display
      .sort({ createdAt: -1 });
    // map to a simpler shape for the frontend dropdown
    const result = applications.map(app => ({
      _id: app._id,
      jobId: app.jobId?._id || app.jobId,
      jobTitle: app.jobId?.title || "",
      candidateId: app.candidateId,
      candidateName: app.candidateName,
      candidateEmail: app.candidateEmail,
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch all job applications" });
  }
});

// HR can fetch users with interviewer role (employees) for interview assignment
router.get("/interviewers", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    // Assuming interviewers are users with role "Employee" (adjust if needed)
    const interviewers = await User.find({ role: { $in: ["Employee", "Interviewer"] } })
      .select("_id name email role")
      .sort({ name: 1 });
    res.json(interviewers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch interviewers" });
  }
});

router.post("/:id/apply", optionalProtect, upload.single("resume"), handleApply);

//  HR can fetch all applications for a specific job
router.get("/:id/applications", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const applications = await JobApplication.find({ jobId: req.params.id })
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch job applications" });
  }
});

export default router;

import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import axios from "axios";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../uploads/resumes");
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only PDF and Word documents are allowed"));
    }
  }
});

// Flask service URL
const FLASK_SERVICE_URL = "http://127.0.0.1:5001";

/**
 * @route   POST /api/resume/screen
 * @desc    Screen resumes against a job description
 * @access  Private (HR only)
 */
router.post("/screen", protect, upload.array("resumes[]"), async (req, res) => {
  try {
    // Check if user is HR (case-insensitive check)
    if (req.user.role.toLowerCase() !== "hr") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Only HR can screen resumes." 
      });
    }

    const { jd, cutoff, autoEmail } = req.body;
    const files = req.files;
    
    if (!jd) {
      return res.status(400).json({ 
        success: false, 
        message: "Job description is required" 
      });
    }
    
    if (!files || files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "At least one resume file is required" 
      });
    }

    // Create form data to send to Flask service
    const formData = new FormData();
    formData.append("jd", jd);
    formData.append("cutoff", cutoff || "0.5");
    if (autoEmail === true || autoEmail === "true") {
      formData.append("send_mails", "on");
    }
    
    // Add resume files to form data
    for (const file of files) {
      const fileData = fs.readFileSync(file.path);
      const blob = new Blob([fileData]);
      formData.append("resumes[]", blob, file.originalname);
    }

    // Send request to Flask service
    const response = await axios.post(`${FLASK_SERVICE_URL}/api/screen`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    // Normalize and return results as an array
    const data = response.data || {};
    const results = Array.isArray(data.results) ? data.results : [];
    const cutoffValue = data.cutoff;
    return res.json({ success: true, results, cutoff: cutoffValue });
  } catch (error) {
    console.error("Resume screening error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to screen resumes", 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/resume/test
 * @desc    Test if Flask service is running
 * @access  Public
 */
router.get("/test", async (req, res) => {
  try {
    const response = await axios.get(FLASK_SERVICE_URL);
    return res.json({ 
      success: true, 
      message: "Flask service is running", 
      data: response.data 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Flask service is not running", 
      error: error.message 
    });
  }
});

export default router;
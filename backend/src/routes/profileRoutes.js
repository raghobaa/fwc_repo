import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/User.js";

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = "uploads";
const resumeDir = "uploads/resumes";
const avatarDir = "uploads/avatars";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(resumeDir)) {
  fs.mkdirSync(resumeDir, { recursive: true });
}
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

// Configure multer for file uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "avatar-" + uniqueSuffix + ext);
  }
});

const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resumes/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "resume-" + uniqueSuffix + ext);
  }
});

// File filter for images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

const uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: imageFilter
});
const uploadResume = multer({ storage: resumeStorage });

// ========== 1. GET USER PROFILE ==========
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Ensure avatar URL is properly formatted for frontend
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const userResponse = user.toObject();
    
    if (userResponse.avatar && !userResponse.avatar.startsWith('http')) {
      userResponse.avatar = `${baseUrl}${userResponse.avatar}`;
    }
    
    res.json(userResponse);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ========== 2. UPDATE FULL PROFILE (SAVE ALL DATA) ==========
router.put("/update-full-profile", protect, async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      linkedin,
      github,
      portfolio,
      professionalSummary,
      userTitle,
      education,
      technicalSkills,
      softSkills,
      workExperience,
      projects,
      certifications,
      careerPreferences,
      languages,
      avatar
    } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update all fields
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (github !== undefined) user.github = github;
    if (portfolio !== undefined) user.portfolio = portfolio;
    if (professionalSummary !== undefined) user.professionalSummary = professionalSummary;
    if (userTitle !== undefined) user.userTitle = userTitle;
    if (avatar !== undefined && avatar !== null && avatar !== "") {
      // Store relative path, not full URL
      if (avatar.startsWith('http')) {
        const urlParts = avatar.split('/');
        const filename = urlParts[urlParts.length - 1];
        user.avatar = `/uploads/avatars/${filename}`;
      } else if (avatar.includes('/uploads/')) {
        user.avatar = avatar;
      } else {
        user.avatar = avatar;
      }
    }
    if (education !== undefined) user.education = education;
    if (technicalSkills !== undefined) user.technicalSkills = technicalSkills;
    if (softSkills !== undefined) user.softSkills = softSkills;
    if (workExperience !== undefined) user.workExperience = workExperience;
    if (projects !== undefined) user.projects = projects;
    if (certifications !== undefined) user.certifications = certifications;
    if (careerPreferences !== undefined) user.careerPreferences = careerPreferences;
    if (languages !== undefined) user.languages = languages;
    
    await user.save();
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const updatedUser = user.toObject();
    delete updatedUser.password;
    
    if (updatedUser.avatar && !updatedUser.avatar.startsWith('http')) {
      updatedUser.avatar = `${baseUrl}${updatedUser.avatar}`;
    }
    
    res.json({ message: "Profile updated successfully", user: updatedUser });
    
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ========== 3. UPLOAD AVATAR ==========
router.post("/upload-avatar", protect, uploadAvatar.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const avatarRelativePath = `/uploads/avatars/${req.file.filename}`;
    const fullAvatarUrl = `${baseUrl}${avatarRelativePath}`;
    
    const user = await User.findById(req.user._id);
    if (user) {
      // Delete old avatar file if it exists and is not default
      if (user.avatar && user.avatar !== '/uploads/avatars/default-avatar.png') {
        const oldAvatarPath = path.join(process.cwd(), user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          try {
            fs.unlinkSync(oldAvatarPath);
          } catch (err) {
            console.log("Could not delete old avatar:", err);
          }
        }
      }
      user.avatar = avatarRelativePath;
      await user.save();
    }
    
    res.json({ 
      success: true,
      avatarUrl: fullAvatarUrl, 
      relativePath: avatarRelativePath,
      message: "Avatar uploaded successfully"
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({ message: "Upload failed" });
  }
});

// ========== 4. UPLOAD RESUME ==========
router.post("/upload-resume", protect, uploadResume.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const resumeRelativePath = `/uploads/resumes/${req.file.filename}`;
    const fullResumeUrl = `${baseUrl}${resumeRelativePath}`;
    
    const user = await User.findById(req.user._id);
    if (user) {
      // Delete old resume if it exists
      if (user.resumeUrl) {
        const oldResumePath = path.join(process.cwd(), user.resumeUrl);
        if (fs.existsSync(oldResumePath)) {
          try {
            fs.unlinkSync(oldResumePath);
          } catch (err) {
            console.log("Could not delete old resume:", err);
          }
        }
      }
      user.resumeUrl = resumeRelativePath;
      await user.save();
    }
    
    res.json({ 
      success: true,
      resumeUrl: fullResumeUrl, 
      relativePath: resumeRelativePath,
      extractedSkills: user?.technicalSkills || [] 
    });
  } catch (error) {
    console.error("Error uploading resume:", error);
    res.status(500).json({ message: "Upload failed" });
  }
});

// ========== 5. GET PROFILE COMPLETION SCORE ==========
router.get("/profile-score", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    let completed = 0;
    const total = 15;
    
    if (user.name && user.name !== "") completed++;
    if (user.phone && user.phone !== "") completed++;
    if (user.location && user.location !== "") completed++;
    if (user.professionalSummary && user.professionalSummary !== "") completed++;
    if (user.education?.degree && user.education.degree !== "") completed++;
    if (user.education?.college && user.education.college !== "") completed++;
    if (user.technicalSkills && user.technicalSkills.length > 0) completed++;
    if (user.softSkills && user.softSkills.length > 0) completed++;
    if (user.workExperience && user.workExperience.length > 0) completed++;
    if (user.projects && user.projects.length > 0) completed++;
    if (user.certifications && user.certifications.length > 0) completed++;
    if (user.resumeUrl && user.resumeUrl !== "") completed++;
    if (user.languages && user.languages.length > 0) completed++;
    if (user.linkedin && user.linkedin !== "") completed++;
    if (user.portfolio && user.portfolio !== "") completed++;
    
    const profileScore = Math.round((completed / total) * 100);
    res.json({ profileScore, completed, total });
    
  } catch (error) {
    console.error("Error calculating profile score:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ========== 6. ADD WORK EXPERIENCE ==========
router.post("/add-work-experience", protect, async (req, res) => {
  try {
    const { companyName, jobTitle, duration, responsibilities, technologiesUsed } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.workExperience.push({
      companyName,
      jobTitle,
      duration,
      responsibilities,
      technologiesUsed
    });
    
    await user.save();
    res.json({ message: "Work experience added", workExperience: user.workExperience });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ========== 7. ADD PROJECT ==========
router.post("/add-project", protect, async (req, res) => {
  try {
    const { name, description, technologiesUsed, role, githubLink } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.projects.push({
      name,
      description,
      technologiesUsed,
      role,
      githubLink
    });
    
    await user.save();
    res.json({ message: "Project added", projects: user.projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ========== 8. ADD CERTIFICATION ==========
router.post("/add-certification", protect, async (req, res) => {
  try {
    const { name, issuingOrg, year, credentialId } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.certifications.push({
      name,
      issuingOrg,
      year,
      credentialId
    });
    
    await user.save();
    res.json({ message: "Certification added", certifications: user.certifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ========== 9. GET ONBOARDING COUNT (REAL-TIME) ==========
router.get("/onboarding-count", protect, async (req, res) => {
  try {
    // Count users who are currently in onboarding process
    // Adjust this query based on your actual schema
    const count = await User.countDocuments({ 
      role: "candidate",
      $or: [
        { onboardingStatus: { $in: ["pending", "in_progress", "started"] } },
        { onboardingCompleted: false },
        { isOnboarded: false }
      ]
    });
    
    res.json({ count: count || 0 });
  } catch (error) {
    console.error("Error fetching onboarding count:", error);
    res.json({ count: 0 });
  }
});

export default router;
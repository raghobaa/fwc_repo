import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, minlength: 6 },

    role: {
      type: String,
      enum: ["Admin", "HR", "Employee", "Candidate"],
      default: "Employee",
    },

    onboardingStatus: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
skills: {
  type: Array,
  default: []
},
learningRoadmap: {
  type: Array,
  default: []
},
// ... other fields like badges, totalLearningHours if needed
    googleId: { type: String, default: null },

    // ========== PROFILE FIELDS ==========
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    professionalSummary: { type: String, default: "" },
    avatar: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    resumeExtractedSkills: [{ type: String }],

    // Education
    education: {
      degree: { type: String, default: "" },
      specialization: { type: String, default: "" },
      college: { type: String, default: "" },
      graduationYear: { type: String, default: "" },
      cgpa: { type: String, default: "" }
    },

    // Skills
    technicalSkills: [{ type: String }],
    softSkills: [{ type: String }],

    // Work Experience
    workExperience: [{
      companyName: String,
      jobTitle: String,
      duration: String,
      responsibilities: String,
      technologiesUsed: String
    }],

    // Projects
    projects: [{
      name: String,
      description: String,
      technologiesUsed: String,
      role: String,
      githubLink: String
    }],

    // Certifications
    certifications: [{
      name: String,
      issuingOrg: String,
      year: String,
      credentialId: String
    }],

    // Career Preferences
    careerPreferences: {
      desiredRole: { type: String, default: "" },
      preferredLocation: { type: String, default: "" },
      expectedSalary: { type: String, default: "" },
      employmentType: { type: String, default: "" }
    },

    // Languages
    languages: [{ type: String }],

    // ========== SKILL TRACKER FIELDS ==========
    userTitle: {
      type: String,
      default: "Software Engineer"
    },

    skills: {
      type: [{
        name: { type: String, required: true },
        percentage: { type: Number, min: 0, max: 100, default: 0 }
      }],
      default: []
    },

    learningRoadmap: {
      type: [{
        title: { type: String, required: true },
        status: { type: String, enum: ['completed', 'in-progress', 'upcoming'], default: 'upcoming' },
        topics: { type: String, required: true },
        progress: { type: Number, min: 0, max: 100, default: 0 }
      }],
      default: []
    },

    interviewHistory: {
      type: [{
        language: { type: String, required: true },
        question: { type: String, required: true },
        answer: { type: String, required: true },
        feedback: { type: String, default: '' },
        rating: { type: Number, min: 0, max: 10 },
        date: { type: Date, default: Date.now }
      }],
      default: []
    },

    badges: { type: [String], default: [] },
    avgInterviewScore: { type: Number, default: 0 },
    totalLearningHours: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// 🔐 Hash password if it's modified
userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔐 Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// ========== SKILL TRACKER METHODS ==========

// Update average interview score
userSchema.methods.updateAvgInterviewScore = async function() {
  if (this.interviewHistory && this.interviewHistory.length > 0) {
    const total = this.interviewHistory.reduce((sum, interview) => sum + (interview.rating || 0), 0);
    this.avgInterviewScore = Math.round(total / this.interviewHistory.length);
    await this.save();
  } else {
    this.avgInterviewScore = 0;
    await this.save();
  }
  return this.avgInterviewScore;
};

// Add a new badge
userSchema.methods.addBadge = async function(badgeName) {
  if (!this.badges.includes(badgeName)) {
    this.badges.push(badgeName);
    await this.save();
  }
  return this.badges;
};

// Update skill proficiency
userSchema.methods.updateSkill = async function(skillName, percentage) {
  const skillIndex = this.skills.findIndex(s => s.name === skillName);
  if (skillIndex !== -1) {
    this.skills[skillIndex].percentage = percentage;
  } else {
    this.skills.push({ name: skillName, percentage });
  }
  await this.save();
  return this.skills;
};

// Update learning roadmap progress
userSchema.methods.updateRoadmapProgress = async function(roadmapTitle, progress, status) {
  const roadmapItem = this.learningRoadmap.find(r => r.title === roadmapTitle);
  if (roadmapItem) {
    if (progress !== undefined) roadmapItem.progress = progress;
    if (status) roadmapItem.status = status;
    await this.save();
  }
  return this.learningRoadmap;
};

// Increment learning hours
userSchema.methods.addLearningHours = async function(hours) {
  this.totalLearningHours = (this.totalLearningHours || 0) + hours;
  await this.save();
  return this.totalLearningHours;
};

// Update streak days
userSchema.methods.updateStreak = async function() {
  this.streakDays = (this.streakDays || 0) + 1;
  await this.save();
  return this.streakDays;
};

// Calculate skill improvement percentage
userSchema.methods.getSkillImprovement = function() {
  if (!this.skills || this.skills.length === 0) return 0;
  const total = this.skills.reduce((sum, skill) => sum + (skill.percentage || 0), 0);
  return Math.round(total / this.skills.length);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
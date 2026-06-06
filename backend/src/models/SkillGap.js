import mongoose from "mongoose";

const skillGapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  jobTitle: { type: String, default: "" },
  jobDescription: { type: String, default: "" },
  matchScore: { type: Number, default: 0 },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  missingTechnologies: [{ type: String }],
  experienceGap: { type: String, default: "" },
  certificationGap: [{ type: String }],
  recommendations: [{ type: String }],
  learningRoadmap: [{
    topic: String,
    priority: String,
    estimatedHours: Number,
    resources: [String]
  }],
  estimatedTimeToReady: { type: String, default: "" },
  analyzedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Check if model already exists to prevent overwrite
export default mongoose.models.SkillGap || mongoose.model("SkillGap", skillGapSchema);
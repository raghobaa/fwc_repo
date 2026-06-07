import mongoose from "mongoose";

const aiInterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["real-time", "written"], required: true },
  language: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  duration: { type: Number, default: null },
  questionCount: { type: Number, default: null },
  questions: [{
    question: String,
    answer: String,
    score: Number,
    feedback: String,
    strengths: [String],
    weaknesses: [String]
  }],
  overallScore: { type: Number, default: 0 },
  strengths: [String],
  weaknesses: [String],
  recommendations: [String],
  status: { type: String, enum: ["in-progress", "completed", "abandoned"], default: "in-progress" },
  completedAt: Date
}, { timestamps: true });

export default mongoose.model("AIInterview", aiInterviewSchema);
import mongoose from "mongoose";

const interviewFeedbackSchema = new mongoose.Schema(
  {
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true, index: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scores: {
      technical: { type: Number, min: 0, max: 10 },
      communication: { type: Number, min: 0, max: 10 },
      problemSolving: { type: Number, min: 0, max: 10 },
      cultureFit: { type: Number, min: 0, max: 10 },
    },
    recommendation: { type: String, enum: ["hire", "no_hire", "hold"], default: "hold" },
    summary: { type: String },
  },
  { timestamps: true }
);

interviewFeedbackSchema.index({ interviewId: 1, submittedBy: 1 }, { unique: true });

export default mongoose.model("InterviewFeedback", interviewFeedbackSchema);

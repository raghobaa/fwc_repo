import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    interviewerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, required: true, default: 60 }, // minutes
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "scheduled",
    },
    roomId: { type: String, required: true, index: true },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Compound index to help with overlap checks per participant
interviewSchema.index({ candidateId: 1, scheduledAt: 1 });
interviewSchema.index({ interviewerIds: 1, scheduledAt: 1 });

export default mongoose.model("Interview", interviewSchema);

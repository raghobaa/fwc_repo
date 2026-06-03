import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidateName: String,
    candidateEmail: String,
    resumePath: String,
  },
  { timestamps: true }
);

export default mongoose.model("JobApplication", jobApplicationSchema);

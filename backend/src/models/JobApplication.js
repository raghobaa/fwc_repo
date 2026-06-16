import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    candidateName: String,
    candidateEmail: String,
    candidatePhone: String,
    coverLetter: String,
    resumePath: String,
    resumeBuffer: Buffer,
    resumeFilename: String,
    resumeMimetype: String,
  },
  { timestamps: true }
);

export default mongoose.model("JobApplication", jobApplicationSchema);

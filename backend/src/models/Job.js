// backend/src/models/Job.js
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  name: { type: String, default: "Anonymous" },
  email: { type: String, default: "N/A" },
  resumePath: String,
});

const jobSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    location: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    applications: [applicationSchema], // 🆕 add this
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);

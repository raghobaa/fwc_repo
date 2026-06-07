import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    name: String,
    email: String,
    phone: String,

    linkedin: String,
    github: String,

    education: String,
    experience: String,
    projects: String,
    skills: String,
  },
  { timestamps: true }
);

export default mongoose.model(
  "Resume",
  ResumeSchema
);
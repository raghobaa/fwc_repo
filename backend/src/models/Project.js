import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ["Active", "Completed"], default: "Active" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    collaboration: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        senderName: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    documents: [
      {
        filename: String,
        originalName: String,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    workReports: [
      {
        title: String,
        filename: String,
        originalName: String,
        weekEnding: Date,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);

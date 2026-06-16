import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  description:    { type: String },
  dueDate:        { type: Date, required: true },
  priority:       { type: String, enum: ["high", "medium", "low"], default: "medium" },
  status:         { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
  progress:       { type: Number, default: 0, min: 0, max: 100 },
  assignedTo:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedToName: { type: String },
  assignedByName: { type: String },
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model("Task", taskSchema);

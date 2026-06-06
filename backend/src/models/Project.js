import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional future extension
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);

import "../config/env.js";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import { Task } from "../models/WorkAssistant.js";

const run = async () => {
  await connectDB();
  const yash = await User.findOne({ name: /yashaswini/i });
  if (!yash) { console.log("User not found"); }
  else {
    const tasks = await Task.find({ user: yash._id });
    console.log("User:", yash.name, "| ID:", yash._id);
    console.log("Tasks found:", tasks.length);
    tasks.forEach(t => console.log(" -", t.title, "|", t.priority, "|", t.status));
  }
  await mongoose.disconnect();
};
run().catch(console.error);

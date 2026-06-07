/**
 * HR Chatbot Server — Port 5011
 * ─────────────────────────────────────────────────────────────────────────────
 * • JWT-protected (HR role only)
 * • Proxies messages to ai-services/hrbot Flask service (port 6000)
 * • Stores every chat in MongoDB  →  hr_chat_logs collection
 * • HR can POST to: leave requests, payrolls, job applications, projects
 * • All other MongoDB collections are GET-only via this server
 * ─────────────────────────────────────────────────────────────────────────────
 */

import express    from "express";
import cors       from "cors";
import dotenv     from "dotenv";
import mongoose   from "mongoose";
import jwt        from "jsonwebtoken";
import axios      from "axios";

// ─── Model imports (all at top-level — ES module requirement) ─────────────────
import User           from "./src/models/User.js";
import LeaveRequest   from "./src/models/LeaveRequest.js";
import Payroll        from "./src/models/Payroll.js";
import JobApplication from "./src/models/JobApplication.js";
import Project        from "./src/models/Project.js";
import Attendance     from "./src/models/Attendance.js";
import Job            from "./src/models/Job.js";
import Interview      from "./src/models/Interview.js";
import Feedback       from "./src/models/Feedback.js";

dotenv.config();

const app      = express();
const PORT     = 5011;
const HRBOT_URL = process.env.HRBOT_URL || "http://localhost:6000";
const MONGO_URI = process.env.MONGO_URI;

// ─── Middleware ───────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

// ─── Chat Log Schema ──────────────────────────────────────────────────────────
const chatLogSchema = new mongoose.Schema({
  hrUserId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  hrUserName: String,
  message:    String,
  response:   String,
  timestamp:  { type: Date, default: Date.now },
});
const ChatLog = mongoose.model("ChatLog", chatLogSchema, "hr_chat_logs");

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Unauthorized: User not found" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

const requireHR = (req, res, next) => {
  const role = (req.user.role || "").toLowerCase();
  if (role !== "hr" && role !== "admin") {
    return res.status(403).json({ message: "Access denied: HR role required" });
  }
  next();
};

// ─── 1. Main chatbot message route ───────────────────────────────────────────
app.post("/api/hr/chatbot/message", protect, requireHR, async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    // Forward to hrbot Flask/Gemini service
    const botRes     = await axios.post(`${HRBOT_URL}/chat`, { message }, { timeout: 30000 });
    const botResponse = botRes.data.response || "No response from AI.";

    // Persist to hr_chat_logs
    await ChatLog.create({
      hrUserId:   req.user._id,
      hrUserName: req.user.name || req.user.email,
      message:    message.trim(),
      response:   botResponse,
    });

    return res.json({ response: botResponse, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("HRBot error:", err.message);
    const errorDetails = err.response?.data?.error || err.response?.data?.message || err.message;
    return res.status(500).json({ message: "Chatbot service error", error: errorDetails });
  }
});

// ─── 2. Chat history for current HR user ─────────────────────────────────────
app.get("/api/hr/chatbot/history", protect, requireHR, async (req, res) => {
  try {
    const logs = await ChatLog.find({ hrUserId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50);
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch history" });
  }
});

// ─── 3. GET-only data routes ──────────────────────────────────────────────────
app.get("/api/hr/chatbot/data/attendance", protect, requireHR, async (_, res) => {
  res.json(await Attendance.find({}).limit(200).lean());
});
app.get("/api/hr/chatbot/data/jobs", protect, requireHR, async (_, res) => {
  res.json(await Job.find({}).limit(200).lean());
});
app.get("/api/hr/chatbot/data/interviews", protect, requireHR, async (_, res) => {
  res.json(await Interview.find({}).limit(200).lean());
});
app.get("/api/hr/chatbot/data/feedback", protect, requireHR, async (_, res) => {
  res.json(await Feedback.find({}).limit(200).lean());
});
app.get("/api/hr/chatbot/data/users", protect, requireHR, async (_, res) => {
  res.json(await User.find({}).select("-password").limit(200).lean());
});

// ─── 4. POST-allowed routes (leave / payroll / applications / projects) ───────
// LEAVE
app.get("/api/hr/chatbot/data/leave", protect, requireHR, async (_, res) => {
  res.json(await LeaveRequest.find({}).limit(200).lean());
});
app.post("/api/hr/chatbot/data/leave", protect, requireHR, async (req, res) => {
  try   { res.status(201).json(await LeaveRequest.create(req.body)); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

// PAYROLL
app.get("/api/hr/chatbot/data/payroll", protect, requireHR, async (_, res) => {
  res.json(await Payroll.find({}).limit(200).lean());
});
app.post("/api/hr/chatbot/data/payroll", protect, requireHR, async (req, res) => {
  try   { res.status(201).json(await Payroll.create(req.body)); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

// JOB APPLICATIONS
app.get("/api/hr/chatbot/data/applications", protect, requireHR, async (_, res) => {
  res.json(await JobApplication.find({}).limit(200).lean());
});
app.post("/api/hr/chatbot/data/applications", protect, requireHR, async (req, res) => {
  try   { res.status(201).json(await JobApplication.create(req.body)); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

// PROJECTS
app.get("/api/hr/chatbot/data/projects", protect, requireHR, async (_, res) => {
  res.json(await Project.find({}).limit(200).lean());
});
app.post("/api/hr/chatbot/data/projects", protect, requireHR, async (req, res) => {
  try   { res.status(201).json(await Project.create(req.body)); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "ok", port: PORT }));

// ─── Start ────────────────────────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ HR Chatbot Server connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`🤖 HR Chatbot Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

import "./config/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import "./config/passport.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import hrRoutes from "./routes/hrRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import { protect } from "./middlewares/authMiddleware.js";
import projectRoutes from "./routes/projectRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import skillGapRoutes from "./routes/skillGapRoutes.js";
import aiInterviewRoutes from "./routes/aiInterviewRoutes.js";
import resumeBuilderRoutes from "./routes/resumeBuilderRoutes.js";
import ideaRoutes from "./routes/ideaRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import jobFinderRoutes from "./routes/jobFinderRoutes.js";
import aiWorkAssistantRoutes from "./routes/aiWorkAssistantRoutes.js";
import interviewAnalyticsRoutes from "./routes/interviewAnalyticsRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

const app = express();

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* --------------------------------------------------
   1. CORS Configuration
--------------------------------------------------- */
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

/* --------------------------------------------------
   2. Basic Middleware
--------------------------------------------------- */
app.use(express.json());
app.use(cookieParser());

/* --------------------------------------------------
   3. Session Handling (For Google OAuth session support)
-------------------------------------------------- */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS in production
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

/* --------------------------------------------------
   4. Passport Authentication
--------------------------------------------------- */
app.use(passport.initialize());
app.use(passport.session());

/* --------------------------------------------------
   5.  Static Files (Resumes Upload Folder)
--------------------------------------------------- */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* --------------------------------------------------
   6.  API Routes
--------------------------------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/employee", employeeRoutes); //  Employee attendance route
app.use("/api/hr/payroll", payrollRoutes); //  Added Payroll route
app.use("/api/projects", projectRoutes);
app.use("/api/chatbot", chatbotRoutes); //  Chatbot route
app.use("/api/resume", resumeRoutes); //  Resume screening route
app.use("/api/interviews", interviewRoutes); //  Interviews scheduling routes
app.use("/api/skill-gap", skillGapRoutes);
app.use("/api/ai-interview", aiInterviewRoutes);
app.use("/api/resume-builder", resumeBuilderRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/skill-tracker", skillRoutes);
app.use("/api/job-finder", jobFinderRoutes);
app.use("/api/ai-work-assistant", aiWorkAssistantRoutes);
app.use("/api/interview-analytics", interviewAnalyticsRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/profile", profileRoutes);

/* --------------------------------------------------
   7.  Debug Route — Check Current Logged-in User (Now uses JWT)
--------------------------------------------------- */
app.get("/api/auth/user", protect, (req, res) => {
  res.json(req.user);
});

/* --------------------------------------------------
   8. Health Check Route
--------------------------------------------------- */
app.get("/", (req, res) => {
  res.send("🚀 HRMS Backend running successfully!");
});

export default app;

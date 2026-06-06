import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

import "./config/passport.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import hrRoutes from "./routes/hrRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import resumeBuilderRoutes from "./routes/resumeBuilderRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import aiInterviewRoutes from "./routes/aiInterviewRoutes.js";
import skillGapRoutes from "./routes/skillGapRoutes.js";
import ideaRoutes from './routes/ideaRoutes.js';
import { protect } from "./middlewares/authMiddleware.js";
import profileRoutes from "./routes/profileRoutes.js";
import jobFinderRoutes from "./routes/jobFinderRoutes.js";
import interviewAnalyticsRoutes from './routes/interviewAnalyticsRoutes.js';
import workAssistantRoutes from './routes/aiWorkAssistantRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    
    const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175'
    ].filter(Boolean);
    
    if (isLocalhost || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || "mysecret",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 24 },
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Static Files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/hr/payroll", payrollRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/resume-builder", resumeBuilderRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/skill-tracker", skillRoutes);
app.use("/api/ai-interview", aiInterviewRoutes);
app.use("/api/skill-gap", skillGapRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/job-finder", jobFinderRoutes);
app.use('/api/interview', interviewAnalyticsRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/work-assistant', workAssistantRoutes);
app.use('/api/tasks', taskRoutes);
// Current User
app.get("/api/auth/user", protect, (req, res) => {
  res.json(req.user);
});

// Health Check
app.get("/", (req, res) => {
  res.send("🚀 HRMS Backend running successfully!");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  return res.status(err.statusCode || 500).json({ message: err.message || "Server Error" });
});

export default app;
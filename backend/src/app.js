import dotenv from "dotenv";
dotenv.config();

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
import jobRoutes from "./routes/jobRoutes.js";
import hrRoutes from "./routes/hrRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js"; // ✅ Employee routes
import payrollRoutes from "./routes/payrollRoutes.js";   // ✅ Payroll routes (new)
import chatbotRoutes from "./routes/chatbotRoutes.js"; // ✅ Chatbot routes
import resumeRoutes from "./routes/resumeRoutes.js"; // ✅ Resume screening routes
import { protect } from "./middlewares/authMiddleware.js"; // ✅ Import protect middleware
import projectRoutes from "./routes/projectRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";

const app = express();

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* --------------------------------------------------
   1. CORS Configuration
--------------------------------------------------- */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
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
app.use("/api/jobs", jobRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/employee", employeeRoutes); //  Employee attendance route
app.use("/api/hr/payroll", payrollRoutes); //  Added Payroll route
app.use("/api/projects", projectRoutes);
app.use("/api/chatbot", chatbotRoutes); //  Chatbot route
app.use("/api/resume", resumeRoutes); //  Resume screening route
app.use("/api/interviews", interviewRoutes); //  Interviews scheduling routes

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

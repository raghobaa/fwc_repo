import express from "express";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import axios from "axios";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import Attendance from "../models/Attendance.js";
import Feedback from "../models/Feedback.js";
import InterviewFeedback from "../models/InterviewFeedback.js";
import Interview from "../models/Interview.js";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Payroll from "../models/Payroll.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the Python chatbot script and its directory
const CHATBOT_DIR = path.join(__dirname, "../../../ai-services/chatbot");
const CHATBOT_PATH = path.join(CHATBOT_DIR, "bot.py");
const RESULT_LIMIT = 8;

const statusFromMessage = (message, allowedStatuses) => {
  const normalized = message.toLowerCase();
  return allowedStatuses.find((status) => normalized.includes(status.toLowerCase()));
};

const roleFromMessage = (message) => {
  const normalized = message.toLowerCase();
  if (normalized.includes("candidate")) return "Candidate";
  if (normalized.includes("employee")) return "Employee";
  if (normalized.includes("admin")) return "Admin";
  if (normalized.includes("hr")) return "HR";
  return null;
};

const collectionTools = {
  users: {
    label: "Users",
    keywords: ["user", "users", "employee", "employees", "candidate", "candidates", "hr", "admin"],
    run: async (message) => {
      const role = roleFromMessage(message);
      const query = role ? { role } : {};
      return User.find(query)
        .select("name email role onboardingStatus department skills createdAt")
        .sort({ createdAt: -1 })
        .limit(RESULT_LIMIT)
        .lean();
    },
    summarize: (items) =>
      items.map((item) => {
        const skills = (item.skills || []).map((skill) => skill.name).filter(Boolean).slice(0, 3);
        return `${item.name || "Unnamed"} (${item.role || "User"}) - ${item.email || "no email"}${
          item.department ? `, ${item.department}` : ""
        }${skills.length ? `, skills: ${skills.join(", ")}` : ""}`;
      }),
  },
  attendances: {
    label: "Attendances",
    keywords: ["attendance", "attendances", "present", "absent"],
    run: async () =>
      Attendance.find()
        .populate("employeeId", "name email")
        .sort({ date: -1 })
        .limit(RESULT_LIMIT)
        .lean(),
    summarize: (items) =>
      items.map(
        (item) =>
          `${item.employeeId?.name || "Employee"} - ${item.status} on ${
            item.date ? new Date(item.date).toLocaleDateString() : "unknown date"
          }`
      ),
  },
  feedbacks: {
    label: "Feedbacks",
    keywords: ["feedback", "feedbacks", "rating", "ratings"],
    run: async () =>
      Feedback.find()
        .populate("employeeId", "name email")
        .sort({ createdAt: -1 })
        .limit(RESULT_LIMIT)
        .lean(),
    summarize: (items) =>
      items.map(
        (item) =>
          `${item.employeeId?.name || "Employee"} rated ${item.rating || "N/A"}/5 - ${item.message || "No message"}`
      ),
  },
  interviewfeedbacks: {
    label: "Interview Feedbacks",
    keywords: ["interview feedback", "interviewfeedback", "recommendation", "hire", "no hire"],
    run: async () =>
      InterviewFeedback.find()
        .populate("interviewId", "title scheduledAt status")
        .populate("submittedBy", "name email")
        .sort({ createdAt: -1 })
        .limit(RESULT_LIMIT)
        .lean(),
    summarize: (items) =>
      items.map((item) => {
        const scores = item.scores || {};
        return `${item.interviewId?.title || "Interview"} - ${item.recommendation || "hold"} by ${
          item.submittedBy?.name || "Reviewer"
        } (technical ${scores.technical ?? "N/A"}, communication ${scores.communication ?? "N/A"})`;
      }),
  },
  interviews: {
    label: "Interviews",
    keywords: ["interview", "interviews", "scheduled", "room"],
    run: async (message) => {
      const status = statusFromMessage(message, ["scheduled", "in_progress", "completed", "cancelled"]);
      return Interview.find(status ? { status } : {})
        .populate("candidateId", "name email")
        .populate("interviewerIds", "name email")
        .sort({ scheduledAt: 1 })
        .limit(RESULT_LIMIT)
        .lean();
    },
    summarize: (items) =>
      items.map(
        (item) =>
          `${item.title || "Interview"} - ${item.status} with ${item.candidateId?.name || "candidate"} on ${
            item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : "unscheduled"
          }`
      ),
  },
  jobapplications: {
    label: "Job Applications",
    keywords: ["application", "applications", "job application", "applicant", "applicants"],
    run: async () =>
      JobApplication.find()
        .populate("jobId", "title location")
        .sort({ createdAt: -1 })
        .limit(RESULT_LIMIT)
        .lean(),
    summarize: (items) =>
      items.map(
        (item) =>
          `${item.candidateName || "Candidate"} applied for ${item.jobId?.title || "a job"} - ${
            item.candidateEmail || "no email"
          }`
      ),
  },
  jobs: {
    label: "Jobs",
    keywords: ["job", "jobs", "opening", "openings", "position", "positions"],
    run: async () =>
      Job.find()
        .select("title description location applications createdAt")
        .sort({ createdAt: -1 })
        .limit(RESULT_LIMIT)
        .lean(),
    summarize: (items) =>
      items.map(
        (item) =>
          `${item.title || "Untitled job"} - ${item.location || "No location"} (${
            item.applications?.length || 0
          } embedded applications)`
      ),
  },
  leaverequests: {
    label: "Leave Requests",
    keywords: ["leave", "leaves", "leave request", "pending leave", "approved leave", "rejected leave"],
    run: async (message) => {
      const status = statusFromMessage(message, ["Pending", "Approved", "Rejected"]);
      return LeaveRequest.find(status ? { status } : {})
        .populate("employeeId", "name email")
        .sort({ createdAt: -1 })
        .limit(RESULT_LIMIT)
        .lean();
    },
    summarize: (items) =>
      items.map(
        (item) =>
          `${item.employeeId?.name || "Employee"} - ${item.status} from ${
            item.startDate ? new Date(item.startDate).toLocaleDateString() : "?"
          } to ${item.endDate ? new Date(item.endDate).toLocaleDateString() : "?"}: ${item.reason || "No reason"}`
      ),
  },
  payrolls: {
    label: "Payrolls",
    keywords: ["payroll", "payrolls", "salary", "salaries", "bonus", "deduction", "net pay"],
    run: async (message) => {
      const status = statusFromMessage(message, ["Draft", "Approved", "Released"]);
      return Payroll.find(status ? { status } : {})
        .populate("employeeId", "name email")
        .sort({ createdAt: -1 })
        .limit(RESULT_LIMIT)
        .lean();
    },
    summarize: (items) =>
      items.map(
        (item) =>
          `${item.employeeId?.name || "Employee"} - ${item.month}: net ${item.netPay}, base ${
            item.baseSalary
          }, status ${item.status}`
      ),
  },
  projects: {
    label: "Projects",
    keywords: ["project", "projects", "active project", "deadline"],
    run: async (message) => {
      const status = statusFromMessage(message, ["Active", "Completed"]);
      return Project.find(status ? { status } : {})
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 })
        .limit(RESULT_LIMIT)
        .lean();
    },
    summarize: (items) =>
      items.map(
        (item) =>
          `${item.title || "Project"} - ${item.status}, deadline ${
            item.deadline ? new Date(item.deadline).toLocaleDateString() : "not set"
          }${item.assignedTo?.name ? `, assigned to ${item.assignedTo.name}` : ""}`
      ),
  },
};

const collectionNames = Object.keys(collectionTools);

const detectTools = (message) => {
  const normalized = message.toLowerCase();
  if (
    ["all collection", "all collections", "database", "mongodb", "everything", "overview", "summary"].some((term) =>
      normalized.includes(term)
    )
  ) {
    return collectionNames;
  }

  const matched = collectionNames.filter((name) => {
    const tool = collectionTools[name];
    return normalized.includes(name) || tool.keywords.some((keyword) => normalized.includes(keyword));
  });

  return matched.length ? matched : collectionNames;
};

const buildCounts = async () => {
  const entries = await Promise.all(
    collectionNames.map(async (name) => {
      const modelMap = {
        users: User,
        attendances: Attendance,
        feedbacks: Feedback,
        interviewfeedbacks: InterviewFeedback,
        interviews: Interview,
        jobapplications: JobApplication,
        jobs: Job,
        leaverequests: LeaveRequest,
        payrolls: Payroll,
        projects: Project,
      };
      return [name, await modelMap[name].countDocuments()];
    })
  );

  return Object.fromEntries(entries);
};

const formatAnswer = ({ message, results, counts }) => {
  const lines = [];
  lines.push("I checked your HRMS MongoDB collections.");

  if (message.toLowerCase().includes("count") || message.toLowerCase().includes("summary")) {
    lines.push("");
    lines.push("Collection counts:");
    collectionNames.forEach((name) => {
      lines.push(`- ${collectionTools[name].label}: ${counts[name] || 0}`);
    });
  }

  results.forEach(({ name, items, summary }) => {
    lines.push("");
    lines.push(`${collectionTools[name].label} (${counts[name] || 0} total):`);
    if (!items.length) {
      lines.push("- No records found.");
      return;
    }
    summary.forEach((line) => lines.push(`- ${line}`));
    if ((counts[name] || 0) > items.length) {
      lines.push(`- Showing latest ${items.length} records.`);
    }
  });

  lines.push("");
  lines.push("You can ask things like: pending leaves, payroll summary, active projects, interviews, candidates, jobs, or all collection counts.");
  return lines.join("\n");
};

/**
 * @route   GET /api/chatbot/test
 * @desc    Test endpoint for the chatbot (no auth required)
 * @access  Public
 */
router.get("/test", (req, res) => {
  res.json({ message: "Chatbot API is working" });
});

/**
 * @route   POST /api/chatbot/hrms
 * @desc    MCP-like read-only chatbot over HRMS MongoDB collections
 * @access  HR/Admin
 */
router.post("/hrms", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const selectedTools = detectTools(message).slice(0, 4);
    const counts = await buildCounts();
    const results = await Promise.all(
      selectedTools.map(async (name) => {
        const tool = collectionTools[name];
        const items = await tool.run(message);
        return {
          name,
          items,
          summary: tool.summarize(items),
        };
      })
    );

    res.json({
      response: formatAnswer({ message, results, counts }),
      toolsUsed: selectedTools,
      counts,
    });
  } catch (error) {
    console.error("HRMS chatbot error:", error);
    res.status(500).json({ error: "Failed to query HRMS collections", details: error.message });
  }
});

/**
 * @route   POST /api/chatbot/message
 * @desc    Send a message to the chatbot and get a response
 * @access  Private
 */
router.post("/message", protect, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Spawn a Python process to run the chatbot script
    // Try the virtual environment first, then fallback to system python
    const venvPythonPath = path.join(__dirname, "../../../ai-services/.venv/bin/python");
    const pythonCommand = fs.existsSync(venvPythonPath)
      ? venvPythonPath
      : (process.platform === 'win32' ? 'python' : 'python3');
    
    console.log(`Executing: ${pythonCommand} ${CHATBOT_PATH} --message "${message}"`);
    
    const python = spawn(pythonCommand, [
      CHATBOT_PATH,
      "--message", 
      message
    ], { 
      cwd: CHATBOT_DIR,  // Set working directory to chatbot directory
      env: { ...process.env }  // Pass environment variables
    });

    let responseData = "";
    let errorData = "";

    // Collect data from script
    python.stdout.on("data", (data) => {
      responseData += data.toString();
    });

    // Collect error data if any
    python.stderr.on("data", (data) => {
      errorData += data.toString();
    });

    // Handle process completion
    python.on("close", (code) => {
      if (code !== 0) {
        console.error(`Chatbot process exited with code ${code}`);
        console.error(`Error: ${errorData}`);
        return res.status(500).json({ 
          error: "Failed to get response from chatbot",
          details: errorData
        });
      }
      
      return res.json({ response: responseData.trim() });
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

/**
 * @route   POST /api/chatbot/employee
 * @desc    Employee/Candidate chatbot — scoped to the logged-in user's own data
 * @access  Private
 */
router.post("/employee", protect, async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: "Message is required" });

  try {
    const userId = req.user._id;

    // Fetch only this user's own data
    const [attendance, leaves, payroll, projects, interviews, feedback] = await Promise.all([
      Attendance.find({ employeeId: userId }).sort({ date: -1 }).limit(10).lean(),
      LeaveRequest.find({ employeeId: userId }).sort({ createdAt: -1 }).limit(10).lean(),
      Payroll.find({ employeeId: userId }).sort({ createdAt: -1 }).limit(6).lean(),
      Project.find({ assignedTo: userId }).limit(10).lean(),
      Interview.find({ candidateId: userId }).sort({ scheduledAt: -1 }).limit(5).lean(),
      Feedback.find({ employeeId: userId }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const userContext = JSON.stringify(
      { attendance, leaves, payroll, projects, interviews, feedback },
      (key, val) => (val instanceof Date ? val.toISOString() : val)
    );

    const scopedMessage = `You are a helpful assistant for an employee named ${req.user.name}. 
Only answer based on their personal HRMS data below. Do not reveal other employees' data.
User data: ${userContext}

Employee asks: ${message}`;

    const HRBOT_URL = process.env.HRBOT_URL || "http://localhost:6000";
    const botRes = await axios.post(`${HRBOT_URL}/chat`, { message: scopedMessage }, { timeout: 30000 });

    return res.json({ response: botRes.data.response, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Employee chatbot error:", err.message);
    return res.status(500).json({ error: "Chatbot error", response: "Sorry, I encountered an error. Please try again." });
  }
});

export default router;

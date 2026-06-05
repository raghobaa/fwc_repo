import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import Attendance from "../models/Attendance.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Payroll from "../models/Payroll.js";
import User from "../models/User.js";
import Feedback from "../models/Feedback.js";

const router = express.Router();

/* POST /api/hr/employees — HR creates an Employee account */
router.post("/employees", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already in use" });

    const employee = await User.create({ name, email, password, role: "Employee" });
    res.status(201).json({
      message: "Employee account created",
      user: { _id: employee._id, name: employee.name, email: employee.email, role: employee.role },
    });
  } catch (err) {
    console.error("HR create employee error:", err);
    res.status(500).json({ message: "Failed to create employee" });
  }
});
const talentBlueprint = {
  Engineering: {
    targetSkills: ["JavaScript", "React", "Node.js", "AWS", "MongoDB"],
    training: {
      AWS: "Run a 3-week AWS fundamentals sprint with cloud deployment labs.",
      React: "Pair frontend engineers on reusable React patterns and state management.",
      "Node.js": "Schedule backend API design practice with code review checkpoints.",
      MongoDB: "Add a MongoDB schema design and query optimization workshop.",
      JavaScript: "Refresh modern JavaScript, async flows, and testing basics.",
    },
  },
  HR: {
    targetSkills: ["Recruitment", "Leadership", "Payroll", "Communication"],
    training: {
      Leadership: "Nominate team leads for people management and conflict resolution coaching.",
      Recruitment: "Use structured interviewing calibration sessions for hiring consistency.",
      Payroll: "Run monthly payroll compliance and compensation policy training.",
      Communication: "Practice employee relations scenarios and feedback conversations.",
    },
  },
  Marketing: {
    targetSkills: ["SEO", "Content Strategy", "Analytics", "Leadership"],
    training: {
      SEO: "Launch an SEO basics program focused on keyword research and page audits.",
      "Content Strategy": "Create a content planning workshop tied to campaign goals.",
      Analytics: "Train the team on funnel dashboards, attribution, and reporting.",
      Leadership: "Build campaign ownership through small-team leadership rotations.",
    },
  },
};

const demoEmployees = [
  {
    name: "Aarav Mehta",
    email: "aarav.engineering@example.com",
    department: "Engineering",
    skills: [
      { name: "JavaScript", level: 90 },
      { name: "React", level: 58 },
      { name: "Node.js", level: 88 },
      { name: "AWS", level: 42 },
      { name: "MongoDB", level: 86 },
    ],
  },
  {
    name: "Isha Rao",
    email: "isha.engineering@example.com",
    department: "Engineering",
    skills: [
      { name: "JavaScript", level: 82 },
      { name: "React", level: 65 },
      { name: "Node.js", level: 84 },
      { name: "AWS", level: 48 },
      { name: "MongoDB", level: 80 },
    ],
  },
  {
    name: "Neha Kapoor",
    email: "neha.hr@example.com",
    department: "HR",
    skills: [
      { name: "Recruitment", level: 78 },
      { name: "Leadership", level: 54 },
      { name: "Payroll", level: 74 },
      { name: "Communication", level: 82 },
    ],
  },
  {
    name: "Kabir Sethi",
    email: "kabir.marketing@example.com",
    department: "Marketing",
    skills: [
      { name: "SEO", level: 70 },
      { name: "Content Strategy", level: 68 },
      { name: "Analytics", level: 55 },
      { name: "Leadership", level: 47 },
    ],
  },
];

const normalizeSkillMap = (skills = []) =>
  skills.reduce((acc, skill) => {
    if (skill?.name) acc[skill.name] = Number(skill.level) || 0;
    return acc;
  }, {});

const buildTalentHeatmap = (employees) => {
  const employeesByDepartment = employees.reduce((acc, employee) => {
    const department = employee.department || "General";
    if (!acc[department]) acc[department] = [];
    acc[department].push(employee);
    return acc;
  }, {});

  const departments = Object.entries(employeesByDepartment).map(([name, team]) => {
    const targetSkills =
      talentBlueprint[name]?.targetSkills ||
      Array.from(new Set(team.flatMap((employee) => (employee.skills || []).map((skill) => skill.name)))).filter(Boolean);

    const skillAverages = targetSkills.map((skillName) => {
      const total = team.reduce((sum, employee) => {
        const skillMap = normalizeSkillMap(employee.skills);
        return sum + (skillMap[skillName] || 0);
      }, 0);

      return {
        name: skillName,
        score: team.length ? Math.round(total / team.length) : 0,
      };
    });

    const score = skillAverages.length
      ? Math.round(skillAverages.reduce((sum, skill) => sum + skill.score, 0) / skillAverages.length)
      : 0;

    const missingSkills = skillAverages
      .filter((skill) => skill.score < 65)
      .sort((a, b) => a.score - b.score)
      .map((skill) => skill.name);

    return {
      name,
      score,
      employeeCount: team.length,
      skills: skillAverages,
      missingSkills,
    };
  });

  const criticalSkillGaps = Array.from(
    new Set(
      departments
        .flatMap((department) => department.missingSkills)
        .filter(Boolean)
    )
  ).slice(0, 6);

  const trainingRecommendations = criticalSkillGaps.map((skill) => {
    const department = departments.find((dept) => dept.missingSkills.includes(skill));
    const recommendation =
      talentBlueprint[department?.name]?.training?.[skill] ||
      `Create a focused learning path for ${skill} and assign mentors to low-scoring employees.`;

    return {
      skill,
      department: department?.name || "All Teams",
      recommendation,
    };
  });

  return {
    departments: departments.sort((a, b) => b.score - a.score),
    criticalSkillGaps,
    trainingRecommendations,
    generatedAt: new Date().toISOString(),
  };
};

/* Get All Attendance - HR */
router.get("/attendance", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const employees = await User.find({ role: "Employee" }).select("name email");
    const attendanceRecords = await Attendance.find();

    const result = employees.map((emp) => {
      const empRecords = attendanceRecords.filter(
        (r) => r.employeeId.toString() === emp._id.toString()
      );
      return {
        _id: emp._id,
        name: emp.name,
        email: emp.email,
        totalAttendance: empRecords.length,
        dates: empRecords.map((r) => r.date),
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Attendance fetch error:", error);
    res.status(500).json({ message: "Failed to fetch attendance records" });
  }
});

/* Get All Leave Requests - HR */
router.get("/leave", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const requests = await LeaveRequest.find()
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Leave fetch error:", error);
    res.status(500).json({ message: "Failed to fetch leave requests" });
  }
});

/* Approve / Reject Leave Request - HR */
router.patch("/leave/:id", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.json({ message: `✅ Leave ${status.toLowerCase()} successfully`, updated });
  } catch (error) {
    console.error("Leave update error:", error);
    res.status(500).json({ message: "Failed to update leave request" });
  }
});

/* Employee Fetch for HR (Simplified) */
router.get("/employees", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const employees = await User.find({ role: "Employee" }).select("name email");
    res.json(employees);
  } catch (error) {
    console.error("Employee fetch error:", error);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
});

/* AI Talent Heatmap - Department skill intelligence */
router.get("/talent-heatmap", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const employees = await User.find({ role: "Employee" }).select(
      "name email department skills"
    );
    const hasSkillData = employees.some(
      (employee) => employee.department && employee.skills?.length
    );
    const sourceEmployees = hasSkillData ? employees : demoEmployees;

    res.json({
      ...buildTalentHeatmap(sourceEmployees),
      source: hasSkillData ? "employee_profiles" : "demo_model",
    });
  } catch (error) {
    console.error("Talent heatmap fetch error:", error);
    res.status(500).json({ message: "Failed to generate talent heatmap" });
  }
});

/* Payroll - Create (Single Employee) */
router.post("/payroll", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const { employeeId, baseSalary, bonus, deductions, month } = req.body;
    const netPay = baseSalary + bonus - deductions;

    const payroll = await Payroll.create({
      employeeId,
      baseSalary,
      bonus,
      deductions,
      netPay,
      month,
    });

    res.json(payroll);
  } catch (error) {
    console.error("Payroll creation error:", error);
    res.status(500).json({ message: "Failed to create payroll" });
  }
});

/* Payroll - Generate (Bulk for all employees) */
router.post("/payroll/generate", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    let { month, baseSalary, allowance, deduction } = req.body;

    // Input validation
    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    // Convert to proper numbers
    baseSalary = Number(baseSalary);
    allowance = Number(allowance);
    deduction = Number(deduction);

    if (isNaN(baseSalary) || isNaN(allowance) || isNaN(deduction)) {
      return res.status(400).json({ message: "Invalid salary inputs" });
    }

    //  Check if payroll already exists for this month
    const existing = await Payroll.findOne({ month });
    if (existing) {
      return res.status(400).json({ message: `Payroll for ${month} already exists` });
    }

    //  Get all employees
    const employees = await User.find({ role: "Employee" });
    if (employees.length === 0) {
      return res.status(400).json({ message: "No employees found" });
    }

    const generatedPayrolls = [];

    //  Generate payrolls properly
    for (const emp of employees) {
      const finalBase = baseSalary;
      const finalBonus = allowance;
      const finalDeductions = deduction;
      const netPay = finalBase + finalBonus - finalDeductions;

      const payroll = await Payroll.create({
        employeeId: emp._id,
        baseSalary: finalBase,
        bonus: finalBonus,
        deductions: finalDeductions,
        netPay,
        month,
        status: "Approved",
      });

      generatedPayrolls.push(payroll);
    }

    res.json({ message: `✅ Payroll generated for ${month}`, payrolls: generatedPayrolls });
  } catch (error) {
    console.error("Payroll generation error:", error);
    res.status(500).json({ error: "Failed to generate payroll" });
  }
});

/* Payroll - Get All */
router.get("/payroll", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const records = await Payroll.find().populate("employeeId", "name email");
    res.json(records);
  } catch (error) {
    console.error("Payroll fetch error:", error);
    res.status(500).json({ message: "Failed to fetch payroll records" });
  }
});

/*  Get All Feedback (HR) */
router.get("/feedback", protect, authorizeRoles("HR", "Admin"), async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    console.error("Feedback fetch error:", err);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

export default router;

/* =========================
   Onboarding Management
   ========================= */
//  Fetch candidates for onboarding
router.get(
  "/onboarding",
  protect,
  authorizeRoles("HR", "Admin"),
  async (req, res) => {
    try {
      const candidates = await User.find({ role: "Candidate" }).select(
        "name email onboardingStatus"
      );
      res.json(candidates);
    } catch (err) {
      console.error("Onboarding list error:", err);
      res.status(500).json({ message: "Failed to fetch onboarding list" });
    }
  }
);

// Start onboarding for a candidate
router.post(
  "/onboarding/:id/trigger",
  protect,
  authorizeRoles("HR", "Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await User.findByIdAndUpdate(
        id,
        { onboardingStatus: "In Progress" },
        { new: true }
      ).select("name email onboardingStatus");
      if (!updated) return res.status(404).json({ message: "Candidate not found" });
      res.json({ message: "Onboarding started", candidate: updated });
    } catch (err) {
      console.error("Onboarding trigger error:", err);
      res.status(500).json({ message: "Failed to start onboarding" });
    }
  }
);

// Withdraw onboarding back to Pending
router.post(
  "/onboarding/:id/withdraw",
  protect,
  authorizeRoles("HR", "Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await User.findByIdAndUpdate(
        id,
        { onboardingStatus: "Pending" },
        { new: true }
      ).select("name email onboardingStatus");
      if (!updated) return res.status(404).json({ message: "Candidate not found" });
      res.json({ message: "Onboarding withdrawn", candidate: updated });
    } catch (err) {
      console.error("Onboarding withdraw error:", err);
      res.status(500).json({ message: "Failed to withdraw onboarding" });
    }
  }
);

// Run with: node src/scripts/seedWorkTasks.js  (from backend/ folder)
import "../config/env.js";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import { Task } from "../models/WorkAssistant.js";

const TASKS = [
  { title: "Review Q2 Performance Reports",        description: "Go through the Q2 performance data and summarize key insights for the team meeting.",   priority: "high",   daysFromNow: 2  },
  { title: "Update HRMS Project Documentation",    description: "Update the technical docs with the latest API changes and module architecture.",          priority: "high",   daysFromNow: 5  },
  { title: "Prepare Weekly Status Report",         description: "Draft this week's status report covering completed tasks, blockers, and next steps.",     priority: "medium", daysFromNow: 1  },
  { title: "Coordinate with Design Team on UI",    description: "Sync with the design team on the new dashboard wireframes and get sign-off.",             priority: "medium", daysFromNow: 4  },
  { title: "Fix Attendance API Bug",               description: "Investigate and resolve the attendance percentage calculation bug reported in staging.",   priority: "high",   daysFromNow: 1  },
  { title: "Review Pull Requests",                 description: "Review pending pull requests from teammates before the Friday merge deadline.",            priority: "medium", daysFromNow: 3  },
  { title: "Write Unit Tests for Leave Module",    description: "Add unit test coverage for the leave request submission and approval flow.",               priority: "low",    daysFromNow: 7  },
  { title: "Team Retrospective Notes",             description: "Compile notes and action items from last sprint's retrospective meeting.",                 priority: "low",    daysFromNow: 6  },
];

const run = async () => {
  await connectDB();

  const employees = await User.find({ role: "Employee" });
  if (!employees.length) { console.error("No employees found."); await mongoose.disconnect(); return; }

  let created = 0;
  for (const emp of employees) {
    const existing = await Task.countDocuments({ user: emp._id });
    if (existing > 0) { console.log(`  Skipped ${emp.name} — already has ${existing} tasks`); continue; }

    for (const t of TASKS) {
      const due = new Date();
      due.setDate(due.getDate() + t.daysFromNow);
      await Task.create({ user: emp._id, title: t.title, description: t.description, priority: t.priority, dueDate: due, status: "pending" });
      created++;
    }
    console.log(`  Created ${TASKS.length} tasks for ${emp.name}`);
  }

  console.log(`\nDone. Total tasks created: ${created}`);
  await mongoose.disconnect();
};

run().catch(err => { console.error(err); process.exit(1); });

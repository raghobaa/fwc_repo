// One-off script to populate demo data for the hackathon presentation video.
// Run with: node src/scripts/seedDemoData.js   (from the backend/ folder)
import "../config/env.js";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import Announcement from "../models/Announcement.js";
import Job from "../models/Job.js";
import { logActivity } from "../utils/logActivity.js";

const run = async () => {
  await connectDB();

  const admin = await User.findOne({ role: "Admin" });
  if (!admin) {
    console.error("No Admin user found — aborting.");
    await mongoose.disconnect();
    return;
  }
  const hr = await User.findOne({ role: "HR" });

  // 1. Add a 4th department
  const deptName = "Quality Assurance";
  let dept = await Department.findOne({ name: deptName });
  if (!dept) {
    dept = await Department.create({
      name: deptName,
      description: "Owns testing, QA processes, and release quality.",
      head: hr ? hr._id : null,
    });
    await logActivity({
      activityType: "DEPARTMENT_CREATED",
      performedBy: admin.name,
      performedByRole: admin.role,
      description: `${admin.name} created department "${deptName}"`,
    });
    console.log("Created department:", deptName);
  } else {
    console.log("Department already exists, skipping:", deptName);
  }

  // 2. Add a few announcements
  const announcements = [
    {
      title: "Welcome to the new HRMS Announcements feature!",
      description: "You can now view all company-wide updates right from your dashboard.",
      priority: "Medium",
      isPinned: true,
    },
    {
      title: "Quarterly All-Hands Meeting — June 20th",
      description: "Join us for the Q2 review and roadmap discussion. Calendar invites going out shortly.",
      priority: "High",
      isPinned: false,
    },
    {
      title: "New Leave Policy Update",
      description: "HR has updated the leave request policy. Please review the changes in the Leave section.",
      priority: "Low",
      isPinned: false,
    },
  ];

  for (const a of announcements) {
    const exists = await Announcement.findOne({ title: a.title });
    if (exists) {
      console.log("Announcement already exists, skipping:", a.title);
      continue;
    }
    await Announcement.create({ ...a, createdBy: admin._id });
    await logActivity({
      activityType: "ANNOUNCEMENT_CREATED",
      performedBy: admin.name,
      performedByRole: admin.role,
      description: `${admin.name} posted announcement: "${a.title}"`,
    });
    console.log("Created announcement:", a.title);
  }

  // 3. Add a few job postings (Recruitment / Open Job Positions)
  const jobs = [
    {
      title: "Frontend Developer (React)",
      description: "Build and maintain user-facing features using React and Tailwind CSS.",
      location: "Bangalore, India",
    },
    {
      title: "Backend Engineer (Node.js)",
      description: "Design and scale REST APIs and services using Node.js, Express, and MongoDB.",
      location: "Remote",
    },
    {
      title: "QA Engineer",
      description: "Own manual and automated testing across the HRMS platform.",
      location: "Hyderabad, India",
    },
  ];

  for (const j of jobs) {
    const exists = await Job.findOne({ title: j.title });
    if (exists) {
      console.log("Job already exists, skipping:", j.title);
      continue;
    }
    await Job.create({ ...j, createdBy: admin._id, applications: [] });
    await logActivity({
      activityType: "JOB_CREATED",
      performedBy: admin.name,
      performedByRole: admin.role,
      description: `${admin.name} posted a new job: "${j.title}"`,
    });
    console.log("Created job posting:", j.title);
  }

  console.log("\nDone seeding demo data.");
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});

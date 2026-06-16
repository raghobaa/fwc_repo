import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  listInterviews,
  getInterview,
  getInterviewByRoom,
  createInterview,
  updateInterview,
  cancelInterview,
  submitFeedback,
} from "../controllers/interviewController.js";

const router = express.Router();

// All routes protected
router.use(protect);

// List interviews: HR sees all, others see their own
router.get("/", listInterviews);

// Static/specific routes must be registered before dynamic :id routes.
router.get("/room/:roomId", getInterviewByRoom);
router.post("/feedback", authorizeRoles("HR", "Admin"), submitFeedback);

// Get one interview (authorized participants or HR)
router.get("/:id", getInterview);

// HR-only operations
router.post("/", authorizeRoles("HR", "Admin"), createInterview);
router.put("/:id", authorizeRoles("HR", "Admin"), updateInterview);
router.delete("/:id", authorizeRoles("HR", "Admin"), cancelInterview);

export default router;

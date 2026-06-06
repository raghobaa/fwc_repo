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

// Get one interview (authorized participants or HR)
router.get("/:id", getInterview);
router.get("/room/:roomId", getInterviewByRoom);

// HR-only operations
router.post("/", authorizeRoles("HR"), createInterview);
router.put("/:id", authorizeRoles("HR"), updateInterview);
router.delete("/:id", authorizeRoles("HR"), cancelInterview);

// HR feedback
router.post("/feedback", authorizeRoles("HR"), submitFeedback);

export default router;

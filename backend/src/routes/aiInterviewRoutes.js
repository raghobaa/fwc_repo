import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  generateQuestions,
  generateRealTimeQuestions,
  evaluateAnswer,
  generateFinalReport,
  saveAIInterview,
  getAIInterviewHistory,
  getAIInterviewById
} from "../controllers/aiInterviewController.js";

const router = express.Router();

router.use(protect);

router.post("/generate-questions", generateQuestions);
router.post("/generate-real-time-questions", generateRealTimeQuestions);
router.post("/evaluate-answer", evaluateAnswer);
router.post("/generate-report", generateFinalReport);
router.post("/save", saveAIInterview);
router.get("/history", getAIInterviewHistory);
router.get("/:id", getAIInterviewById);

export default router;
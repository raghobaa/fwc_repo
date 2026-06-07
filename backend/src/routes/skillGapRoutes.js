import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { analyzeSkillGap, getAnalysisHistory } from "../controllers/skillGapController.js";

const router = express.Router();

router.use(protect);

router.post("/analyze", analyzeSkillGap);
router.get("/history", getAnalysisHistory);

export default router;
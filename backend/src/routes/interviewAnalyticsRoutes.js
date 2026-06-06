import express from 'express';
import { getInterviewAnalytics, submitInterviewSession, getInterviewHistory } from '../controllers/interviewAnalyticsController.js';

const router = express.Router();

// Auth middleware (adjust based on your auth system)
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Add your token verification logic here
  next();
};

router.get('/analytics/:candidateId', authMiddleware, getInterviewAnalytics);
router.get('/history/:candidateId', authMiddleware, getInterviewHistory);
router.post('/session', authMiddleware, submitInterviewSession);

export default router;
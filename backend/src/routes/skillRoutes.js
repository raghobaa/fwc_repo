import express from 'express';
import * as skillController from '../controllers/skillController.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// ✅ Authentication middleware – verifies JWT and attaches user
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ message: 'User not found' });
      next();
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
};

router.use(protect);

router.get('/skills', skillController.getUserSkills);
router.put('/skills', skillController.updateUserSkills);
router.get('/roadmap', skillController.getLearningRoadmap);
router.put('/roadmap', skillController.updateLearningRoadmap);
router.get('/stats', skillController.getSkillStats);
router.post('/mock/questions', skillController.getMockInterviewQuestions);
router.post('/mock/submit', skillController.submitMockInterviewAnswer);

export default router;
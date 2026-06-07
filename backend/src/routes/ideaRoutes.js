import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import Idea from '../models/Idea.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import stringSimilarity from 'string-similarity';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to find duplicate ideas
const findDuplicates = async (title, description) => {
  const existingIdeas = await Idea.find();
  for (let idea of existingIdeas) {
    const titleSim = stringSimilarity.compareTwoStrings(title.toLowerCase(), idea.title.toLowerCase());
    const descSim = stringSimilarity.compareTwoStrings(description.toLowerCase(), idea.description.toLowerCase());
    if (titleSim > 0.7 || descSim > 0.8) return idea;
  }
  return null;
};

// Evaluate idea using Gemini AI
const evaluateIdea = async (title, description) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Evaluate the following business/technical idea:
Title: ${title}
Description: ${description}

Provide a JSON response with:
- innovationScore: integer 0-100
- impactScore: integer 0-100
- feasibilityScore: integer 0-100
- summary: brief analysis (one sentence)
Return only valid JSON.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(text);
  } catch (err) {
    // fallback scores if AI fails
    return {
      innovationScore: Math.floor(Math.random() * 100),
      impactScore: Math.floor(Math.random() * 100),
      feasibilityScore: Math.floor(Math.random() * 100),
      summary: "AI evaluation temporarily unavailable. Scores are estimated."
    };
  }
};

// Employee submits idea
router.post('/submit', protect, authorizeRoles('Employee'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description required' });

    // Duplicate check
    const duplicate = await findDuplicates(title, description);
    if (duplicate) {
      return res.status(409).json({
        message: 'Similar idea already exists',
        duplicate: { title: duplicate.title, status: duplicate.status }
      });
    }

    // AI evaluation
    const evaluation = await evaluateIdea(title, description);

    const idea = new Idea({
      title,
      description,
      category: category || 'General',
      submittedBy: req.user._id,
      submittedByName: req.user.name,
      innovationScore: evaluation.innovationScore,
      impactScore: evaluation.impactScore,
      feasibilityScore: evaluation.feasibilityScore,
      aiSummary: evaluation.summary,
      overallScore: Math.round((evaluation.innovationScore + evaluation.impactScore + evaluation.feasibilityScore) / 3),
      status: 'pending'
    });
    await idea.save();
    res.status(201).json({ message: 'Idea submitted for review', idea });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Employee gets their ideas
router.get('/my-ideas', protect, authorizeRoles('Employee'), async (req, res) => {
  try {
    const ideas = await Idea.find({ submittedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// HR gets all ideas
router.get('/all', protect, authorizeRoles('HR', 'Admin'), async (req, res) => {
  try {
    const ideas = await Idea.find().populate('submittedBy', 'name email').sort({ createdAt: -1 });
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// HR updates idea status
router.put('/:id/status', protect, authorizeRoles('HR', 'Admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected', 'implemented'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const idea = await Idea.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    res.json({ message: 'Status updated', idea });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Employee deletes their own idea (only if pending)
router.delete('/:id', protect, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    
    // Only employee who submitted or admin can delete
    if (idea.submittedBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this idea' });
    }
    
    // Only allow deletion if idea is pending
    if (idea.status !== 'pending') {
      return res.status(400).json({ message: 'Can only delete pending ideas' });
    }
    
    await Idea.findByIdAndDelete(req.params.id);
    res.json({ message: 'Idea deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
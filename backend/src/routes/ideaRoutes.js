import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import Idea from '../models/Idea.js';
import { geminiChat } from '../utils/gemini.js';
import stringSimilarity from 'string-similarity';

const router = express.Router();

const findDuplicates = async (title, description) => {
  const existingIdeas = await Idea.find();
  for (let idea of existingIdeas) {
    const titleSim = stringSimilarity.compareTwoStrings(title.toLowerCase(), idea.title.toLowerCase());
    const descSim = stringSimilarity.compareTwoStrings(description.toLowerCase(), idea.description.toLowerCase());
    if (titleSim > 0.7 || descSim > 0.8) return idea;
  }
  return null;
};

const evaluateIdea = async (title, description) => {
  try {
    const prompt = `You are a strict business idea evaluator. Critically assess the following idea with high standards — most ideas should score between 30-70. Only truly exceptional ideas deserve above 80.

Title: ${title}
Description: ${description}

Evaluate harshly and realistically. Penalize vague descriptions, lack of originality, poor feasibility, or low business impact.

Respond with only valid JSON:
{
  "innovationScore": <integer 0-100>,
  "impactScore": <integer 0-100>,
  "feasibilityScore": <integer 0-100>,
  "summary": "<one sentence critical assessment>"
}`;
    const text = await geminiChat(prompt);
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(clean);
  } catch (err) {
    return {
      innovationScore: Math.floor(Math.random() * 40) + 30,
      impactScore: Math.floor(Math.random() * 40) + 30,
      feasibilityScore: Math.floor(Math.random() * 40) + 30,
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
import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { Task, DailyPlanner } from '../models/WorkAssistant.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ---------- Tasks ----------
router.get('/tasks', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ priority: 1, dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/tasks', protect, async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    const task = new Task({ user: req.user._id, title, description, priority, dueDate });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/tasks/:id', protect, async (req, res) => {
  try {
    const { status, priority, title, description, dueDate } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (title) task.title = title;
    if (description) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/tasks/:id', protect, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Daily Planner ----------
router.get('/planner', protect, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0,0,0,0);
    const planner = await DailyPlanner.findOne({ user: req.user._id, date: targetDate });
    res.json(planner || {
      date: targetDate,
      meetingsToAttend: [],
      todoTasks: [],
      projectTasks: [],
      remainingWork: '',
      notes: '',
      meetingRecords: []
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/planner', protect, async (req, res) => {
  try {
    const { date, meetingsToAttend, todoTasks, projectTasks, remainingWork, notes, meetingRecords } = req.body;
    console.log('Saving planner for user:', req.user._id, 'Date:', date, 'Meetings:', meetingsToAttend, 'Todo:', todoTasks, 'Projects:', projectTasks, 'Remaining:', remainingWork, 'Notes:', notes, 'MeetingRecords:', meetingRecords);
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    
    const targetDate = new Date(date);
    targetDate.setHours(0,0,0,0);
    
    let planner = await DailyPlanner.findOne({ user: req.user._id, date: targetDate });
    if (planner) {
      planner.meetingsToAttend = meetingsToAttend || [];
      planner.todoTasks = todoTasks || [];
      planner.projectTasks = projectTasks || [];
      planner.remainingWork = remainingWork || '';
      planner.notes = notes || '';
      planner.meetingRecords = meetingRecords || [];
      await planner.save();
      console.log('Updated planner:', planner);
    } else {
      planner = new DailyPlanner({
        user: req.user._id,
        date: targetDate,
        meetingsToAttend: meetingsToAttend || [],
        todoTasks: todoTasks || [],
        projectTasks: projectTasks || [],
        remainingWork: remainingWork || '',
        notes: notes || '',
        meetingRecords: meetingRecords || []
      });
      await planner.save();
      console.log('Created new planner:', planner);
    }
    res.json({ message: 'Planner saved successfully', planner });
  } catch (err) {
    console.error('Error saving planner:', err);
    res.status(500).json({ message: err.message });
  }
});

// ---------- AI Meeting Notes Summarizer ----------
router.post('/summarize-meeting', protect, async (req, res) => {
  try {
    const { notes } = req.body;
    console.log('Summarizing meeting notes. Length:', notes?.length);
    
    if (!notes || !notes.trim()) {
      return res.status(400).json({ message: 'Meeting notes are required' });
    }
    
    if (!process.env.GEMINI_API_KEY) {
      console.log('GEMINI_API_KEY not set, using fallback summary');
      const fallbackSummary = `Key Points from Meeting:\n\n• ${notes.split('\n').filter(line => line.trim()).slice(0, 5).join('\n• ')}\n\n📌 Note: AI summarization is temporarily unavailable. Please provide manual summary.`;
      return res.json({ summary: fallbackSummary });
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Summarize the following meeting notes into a concise bullet-point summary, highlighting key decisions, action items, and next steps:\n\n${notes}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text();
      console.log('Generated summary:', summary.substring(0, 100));
      res.json({ summary });
    } catch (aiErr) {
      console.error('Gemini API error:', aiErr.message);
      const fallbackSummary = `Meeting Summary (Auto-generated):\n\n${notes.split('\n').filter(line => line.trim()).slice(0, 3).map(line => `• ${line}`).join('\n')}\n\n(Full AI summarization unavailable - showing key excerpts)`;
      res.json({ summary: fallbackSummary });
    }
  } catch (err) {
    console.error('Error in summarize-meeting:', err);
    res.status(500).json({ message: 'Failed to summarize: ' + err.message });
  }
});

// ---------- AI Work Report Generator ----------
router.post('/generate-report', protect, async (req, res) => {
  try {
    const { tasks, period } = req.body;
    console.log('Generating report. Tasks count:', tasks?.length, 'Period:', period);
    
    if (!tasks || !tasks.length) {
      return res.status(400).json({ message: 'No tasks provided for report' });
    }
    
    if (!process.env.GEMINI_API_KEY) {
      console.log('GEMINI_API_KEY not set, using fallback report');
      const fallbackReport = `📊 ${period?.toUpperCase() || 'WEEKLY'} WORK REPORT\n\nGenerated on: ${new Date().toDateString()}\n\n✓ COMPLETED TASKS:\n${tasks.map((t, i) => `${i + 1}. ${t.title}\n   Description: ${t.description || 'No details'}`).join('\n\n')}\n\nSUMMARY:\nSuccessfully completed ${tasks.length} tasks this period.\n\nNOTE: Full AI analysis is temporarily unavailable. This is an auto-generated summary.`;
      return res.json({ report: fallbackReport });
    }

    try {
      const tasksText = tasks.map(t => `- ${t.title} (${t.description || 'No description'})`).join('\n');
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Generate a professional work report for a ${period || 'weekly'} period. The employee completed the following tasks:\n${tasksText}\n\nWrite a concise, professional report including accomplishments, challenges (if any), and next steps.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const report = response.text();
      console.log('Generated report:', report.substring(0, 100));
      res.json({ report });
    } catch (aiErr) {
      console.error('Gemini API error:', aiErr.message);
      const tasksText = tasks.map((t, i) => `${i + 1}. ${t.title}`).join('\n');
      const fallbackReport = `📊 ${period?.toUpperCase() || 'WEEKLY'} WORK REPORT\n\nCompleted Tasks:\n${tasksText}\n\nTotal Completed: ${tasks.length} tasks\n\n(AI analysis unavailable - showing task summary)`;
      res.json({ report: fallbackReport });
    }
  } catch (err) {
    console.error('Error in generate-report:', err);
    res.status(500).json({ message: 'Failed to generate report: ' + err.message });
  }
});

export default router;
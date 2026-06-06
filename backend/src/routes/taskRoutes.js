import express from 'express';
import mongoose from 'mongoose';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ---------- Task Model ----------
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedToName: { type: String },
  assignedByName: { type: String },
}, { timestamps: true });

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

// ---------- Helper to get user name (for creating tasks) ----------
const getUserName = async (userId) => {
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  return user ? user.name : 'Unknown';
};

// ---------- Middleware to attach names before saving (optional) ----------
router.use(async (req, res, next) => {
  if (req.body.assignedTo && !req.body.assignedToName) {
    req.body.assignedToName = await getUserName(req.body.assignedTo);
  }
  if (req.user && !req.body.assignedByName) {
    req.body.assignedByName = req.user.name;
  }
  next();
});

// ---------- Routes ----------

// HR/Manager: Create a task (assign to employee)
router.post('/', protect, authorizeRoles('HR', 'Admin'), async (req, res) => {
  try {
    const { title, description, dueDate, priority, assignedTo } = req.body;
    if (!title || !dueDate || !assignedTo) {
      return res.status(400).json({ message: 'Title, due date, and assigned employee are required' });
    }
    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      assignedTo,
      assignedBy: req.user._id,
      assignedToName: await getUserName(assignedTo),
      assignedByName: req.user.name
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// HR/Manager: Get all tasks (for dashboard)
router.get('/all', protect, authorizeRoles('HR', 'Admin'), async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedTo', 'name email').sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// HR/Manager: Update any task (status, priority, etc.)
router.put('/:id', protect, authorizeRoles('HR', 'Admin'), async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// HR/Manager: Delete a task
router.delete('/:id', protect, authorizeRoles('HR', 'Admin'), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Employee: Get tasks assigned to me
router.get('/my-tasks', protect, authorizeRoles('Employee'), async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id }).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Employee: Update status or progress of their own task
router.put('/my-tasks/:id', protect, authorizeRoles('Employee'), async (req, res) => {
  try {
    const { status, progress } = req.body;
    const task = await Task.findOne({ _id: req.params.id, assignedTo: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found or not assigned to you' });
    if (status) task.status = status;
    if (progress !== undefined) task.progress = Math.min(100, Math.max(0, progress));
    if (task.progress === 100) task.status = 'completed';
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
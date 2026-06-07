import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  dueDate: { type: Date },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const dailyPlannerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  meetingsToAttend: [{ type: String }],
  todoTasks: [{ type: String }],
  projectTasks: [{ type: String }],
  remainingWork: { type: String },
  notes: { type: String },
  meetingRecords: [
    {
      title: { type: String, required: true },
      notes: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
export const DailyPlanner = mongoose.models.DailyPlanner || mongoose.model('DailyPlanner', dailyPlannerSchema);
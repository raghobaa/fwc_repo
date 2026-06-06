import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending_acceptance', 'active', 'ongoing', 'completed', 'rejected'],
    default: 'pending_acceptance'
  },
  progress: { type: Number, default: 0 },
  collaboration: [{ sender: String, message: String, timestamp: Date }],
  documents: [{ filename: String, originalName: String, filePath: String, uploadedBy: String, uploadedAt: Date }],
  workReports: [{ title: String, filename: String, filePath: String, uploadedBy: String, weekEnding: Date, uploadedAt: Date }]
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
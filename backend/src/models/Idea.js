import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'General' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submittedByName: { type: String, required: true },
  innovationScore: { type: Number, min: 0, max: 100 },
  impactScore: { type: Number, min: 0, max: 100 },
  feasibilityScore: { type: Number, min: 0, max: 100 },
  overallScore: { type: Number, min: 0, max: 100 },
  aiSummary: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'implemented'], default: 'pending' },
  hrFeedback: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Idea', ideaSchema);
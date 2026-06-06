import mongoose from 'mongoose';

const interviewAnswerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  candidateAnswer: { type: String, required: true },
  idealAnswer: { type: String },
  score: { type: Number, default: 0 },
  topic: { type: String, default: 'General' },
  difficulty: { type: String, default: 'medium' }
}, { timestamps: true });

const interviewSessionSchema = new mongoose.Schema({
  interviewId: { type: String, required: true, unique: true },
  candidateId: { type: String, required: true, index: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['technical', 'behavioral', 'mock', 'hr'], default: 'mock' },
  overallScore: { type: Number, default: 0 },
  technicalScore: { type: Number, default: 0 },
  communicationScore: { type: Number, default: 0 },
  confidenceScore: { type: Number, default: 0 },
  answers: [interviewAnswerSchema],
  feedback: { type: String }
}, { timestamps: true });

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

export default InterviewSession;
import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  coverLetter: { type: String },
  resumePath: { type: String, required: true },
  appliedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }
});

export default mongoose.model('JobApplication', jobApplicationSchema);
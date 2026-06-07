import JobApplication from '../models/JobApplication.js';

export const applyForJob = async (req, res) => {
  try {
    const { jobId, name, email, phone, coverLetter } = req.body;
    const candidateId = req.user._id;

    if (!req.file) return res.status(400).json({ message: 'Resume required' });

    const resumePath = `/uploads/resumes/${req.file.filename}`;

    const app = new JobApplication({ jobId, candidateId, name, email, phone, coverLetter, resumePath });
    await app.save();

    res.status(201).json({ message: 'Application submitted', applicationId: app._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getAppliedJobs = async (req, res) => {
  try {
    const apps = await JobApplication.find({ candidateId: req.user._id }).select('jobId');
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
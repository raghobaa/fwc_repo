import User from "../models/User.js";

export const getUserSkills = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.skills || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const updateUserSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.skills = skills;
    await user.save();
    res.json({ message: "Skills updated", skills });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getLearningRoadmap = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.learningRoadmap || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const updateLearningRoadmap = async (req, res) => {
  try {
    const { roadmap } = req.body;
    const user = await User.findById(req.user._id);
    user.learningRoadmap = roadmap;
    await user.save();
    res.json({ message: "Roadmap updated", roadmap });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getSkillStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      languagesAssessed: user.skills?.length || 0,
      mockInterviewsCompleted: user.interviewHistory?.length || 0,
      avgScore: user.avgInterviewScore || 74,
      scoreChange: 8,
      badges: user.badges || ["Python", "SQL", "Git"],
      totalLearningHours: user.totalLearningHours || 120,
      streakDays: user.streakDays || 15
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Stubs for mock interview (if your frontend calls these)
export const getMockInterviewQuestions = async (req, res) => res.json({ questions: [] });
export const submitMockInterviewAnswer = async (req, res) => res.json({ feedback: "Coming soon" });
import User from "../models/User.js";

export const getUserSkills = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.skills || []);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    const user = await User.findById(req.user._id);
    user.skills = skills;
    await user.save();
    res.json({ message: "Skills updated", skills });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getLearningRoadmap = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.learningRoadmap || []);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateLearningRoadmap = async (req, res) => {
  try {
    const { roadmap } = req.body;
    const user = await User.findById(req.user._id);
    user.learningRoadmap = roadmap;
    await user.save();
    res.json({ message: "Roadmap updated", roadmap });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getSkillStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const stats = {
      languagesAssessed: user.skills?.length || 0,
      mockInterviewsCompleted: user.interviewHistory?.length || 0,
      avgScore: user.avgInterviewScore || 74,
      scoreChange: 8,
      badges: user.badges || ["Python", "SQL", "Git"],
      totalLearningHours: user.totalLearningHours || 120,
      streakDays: user.streakDays || 15
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Optional mock interview exports (if you still need them)
export const getMockInterviewQuestions = async (req, res) => {
  res.json({ questions: [] });
};

export const submitMockInterviewAnswer = async (req, res) => {
  res.json({ feedback: "Mock feedback" });
};
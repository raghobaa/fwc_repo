import { GoogleGenerativeAI } from "@google/generative-ai";
import AIInterview from "../models/AIInterview.js";
import User from "../models/User.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateQuestions = async (req, res) => {
  try {
    const { language, difficulty, questionCount } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate ${questionCount} technical interview questions for a ${difficulty} level ${language} developer position.
    Return as JSON array only:
    [
      {"text": "What is the difference between state and props in React?", "difficulty": "${difficulty}"}
    ]`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let questionsText = response.text();
    questionsText = questionsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const questions = JSON.parse(questionsText);
    
    res.json({ questions });
  } catch (error) {
    console.error("Error:", error);
    const fallback = [
      { text: "What is your experience with " + req.body.language + "?", difficulty: "Easy" },
      { text: "Explain a challenging problem you solved using " + req.body.language + ".", difficulty: "Medium" }
    ];
    res.json({ questions: fallback.slice(0, req.body.questionCount || 5) });
  }
};

export const generateRealTimeQuestions = async (req, res) => {
  try {
    const { language, difficulty, questionCount } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate ${questionCount} short conversational interview questions for a ${difficulty} level ${language} developer.
    Return as JSON array only:
    [
      {"text": "Can you explain what closures are in JavaScript?", "difficulty": "${difficulty}"}
    ]`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let questionsText = response.text();
    questionsText = questionsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const questions = JSON.parse(questionsText);
    
    res.json({ questions });
  } catch (error) {
    console.error("Error:", error);
    const fallback = [
      { text: "Tell me about your experience with " + req.body.language + ".", difficulty: "Easy" },
      { text: "What's your favorite feature in " + req.body.language + "?", difficulty: "Easy" }
    ];
    res.json({ questions: fallback.slice(0, req.body.questionCount || 5) });
  }
};

export const evaluateAnswer = async (req, res) => {
  try {
    const { question, answer, language } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Evaluate this ${language} interview answer. Return ONLY valid JSON:
    Question: ${question}
    Answer: ${answer}
    
    JSON format: {"score": 0-100, "feedback": "feedback text", "strengths": ["s1"], "weaknesses": ["w1"]}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let evaluationText = response.text();
    evaluationText = evaluationText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const evaluation = JSON.parse(evaluationText);
    
    res.json(evaluation);
  } catch (error) {
    console.error("Error:", error);
    res.json({ 
      score: 70, 
      feedback: "Good attempt! Keep practicing.", 
      strengths: ["Question attempted"], 
      weaknesses: ["Could be more detailed"] 
    });
  }
};

export const generateFinalReport = async (req, res) => {
  try {
    const { answers } = req.body;
    const totalScore = answers.reduce((sum, a) => sum + (a.score || 70), 0);
    const overallScore = Math.round(totalScore / answers.length);
    
    res.json({
      overallScore,
      strengths: ["Good communication", "Basic knowledge understanding"],
      weaknesses: ["Need more practice", "Could be more detailed"],
      recommendations: ["Practice daily coding", "Review core concepts", "Take more mock interviews"],
      summary: `You scored ${overallScore}%. Keep practicing to improve!`
    });
  } catch (error) {
    console.error("Error:", error);
    res.json({ overallScore: 70, strengths: [], weaknesses: [], recommendations: [], summary: "" });
  }
};

export const saveAIInterview = async (req, res) => {
  try {
    const { type, language, difficulty, duration, questionCount, questions, overallScore, strengths, weaknesses, recommendations } = req.body;
    
    const aiInterview = new AIInterview({
      userId: req.user._id,
      type, language, difficulty, duration, questionCount,
      questions: questions || [],
      overallScore: overallScore || 0,
      strengths: strengths || [],
      weaknesses: weaknesses || [],
      recommendations: recommendations || [],
      status: "completed",
      completedAt: new Date()
    });
    
    await aiInterview.save();
    
    const user = await User.findById(req.user._id);
    user.interviewHistory = user.interviewHistory || [];
    user.interviewHistory.push({ 
      language, 
      type, 
      rating: Math.round((overallScore || 70) / 10), 
      date: new Date() 
    });
    
    if (user.updateAvgInterviewScore) {
      await user.updateAvgInterviewScore();
    }
    await user.save();
    
    res.json({ interviewId: aiInterview._id, message: "Interview saved successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to save interview" });
  }
};

export const getAIInterviewHistory = async (req, res) => {
  try {
    const interviews = await AIInterview.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json(interviews);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch interviews" });
  }
};

export const getAIInterviewById = async (req, res) => {
  try {
    const interview = await AIInterview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) return res.status(404).json({ error: "Interview not found" });
    res.json(interview);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch interview" });
  }
};
import InterviewSession from '../models/InterviewAnalytics.js';

// Calculate performance trend
const calculatePerformanceTrend = (scores) => {
  if (scores.length < 2) return { trend: 'Stable', improvement: 0 };
  
  const mid = Math.floor(scores.length / 2);
  const firstHalf = scores.slice(0, mid);
  const secondHalf = scores.slice(mid);
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const improvement = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  let trend = 'Stable';
  if (improvement > 10) trend = 'Improving';
  else if (improvement < -10) trend = 'Declining';
  
  return { trend, improvement: Math.abs(improvement).toFixed(1) };
};

// Identify strong and weak topics
const identifyTopics = (answers) => {
  const topicScores = {};
  const topicFrequency = {};
  
  answers.forEach(answer => {
    const topic = answer.topic || 'General';
    if (!topicScores[topic]) {
      topicScores[topic] = [];
      topicFrequency[topic] = 0;
    }
    topicScores[topic].push(answer.score);
    topicFrequency[topic]++;
  });
  
  const strongTopics = [];
  const weakTopics = [];
  
  Object.keys(topicScores).forEach(topic => {
    const avgScore = topicScores[topic].reduce((a, b) => a + b, 0) / topicScores[topic].length;
    const frequency = topicFrequency[topic];
    
    if (avgScore >= 70 && frequency >= 2) {
      strongTopics.push(topic);
    } else if (avgScore < 55 || (avgScore < 65 && frequency >= 3)) {
      weakTopics.push(topic);
    }
  });
  
  return { 
    strongTopics: strongTopics.slice(0, 5), 
    weakTopics: weakTopics.slice(0, 5)
  };
};

// Analyze skill growth
const analyzeSkillGrowth = (interviews) => {
  const skillOverTime = {};
  
  interviews.forEach((interview, idx) => {
    if (interview.answers && interview.answers.length > 0) {
      interview.answers.forEach(answer => {
        const topic = answer.topic || 'General';
        if (!skillOverTime[topic]) skillOverTime[topic] = [];
        skillOverTime[topic].push({ score: answer.score, interviewIndex: idx });
      });
    }
  });
  
  const improvedSkills = [];
  const stagnantSkills = [];
  
  Object.keys(skillOverTime).forEach(skill => {
    const scores = skillOverTime[skill];
    if (scores.length >= 2) {
      const firstScore = scores[0].score;
      const lastScore = scores[scores.length - 1].score;
      const improvement = lastScore - firstScore;
      
      if (improvement > 15) {
        improvedSkills.push(skill);
      } else if (Math.abs(improvement) < 10 && scores.length >= 3) {
        stagnantSkills.push(skill);
      }
    }
  });
  
  return { improvedSkills: improvedSkills.slice(0, 3), stagnantSkills: stagnantSkills.slice(0, 3) };
};

// Generate recommendations
const generateRecommendations = (weakTopics, stagnantSkills, overallScore) => {
  const recommendations = [];
  
  weakTopics.forEach(topic => {
    recommendations.push(`📚 Focus on improving ${topic} - take online courses and practice daily`);
  });
  
  stagnantSkills.forEach(skill => {
    recommendations.push(`🎯 Your ${skill} skills are stagnant - try advanced challenges and real projects`);
  });
  
  if (overallScore < 60) {
    recommendations.push(`📖 Build strong fundamentals before attempting advanced topics`);
  } else if (overallScore < 75) {
    recommendations.push(`🎤 Practice mock interviews weekly to improve communication and confidence`);
  } else {
    recommendations.push(`🚀 You're ready for senior roles! Focus on system design and leadership skills`);
  }
  
  recommendations.push(`💡 Use AI mock interviews 2-3 times per week for consistent improvement`);
  recommendations.push(`📝 Record your answers and review them to identify improvement areas`);
  
  return recommendations.slice(0, 6);
};

// Compare answers
const compareAnswers = (answers) => {
  const comparisons = [];
  
  if (!answers || answers.length === 0) return comparisons;
  
  answers.forEach(answer => {
    if (answer.idealAnswer) {
      const completeness = Math.min((answer.candidateAnswer.length / Math.max(answer.idealAnswer.length, 1)) * 100, 100);
      
      comparisons.push({
        question: answer.question,
        candidateAnswer: answer.candidateAnswer,
        idealAnswer: answer.idealAnswer,
        accuracyScore: Math.round(answer.score),
        completenessScore: Math.round(completeness),
        technicalDepthScore: Math.round(answer.score),
        confidenceScore: Math.round(answer.communicationScore || 75)
      });
    }
  });
  
  return comparisons.slice(0, 5);
};

// Get Interview Analytics
export const getInterviewAnalytics = async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    if (!candidateId) {
      return res.status(400).json({ error: 'candidateId is required' });
    }
    
    const interviews = await InterviewSession.find({ candidateId }).sort({ date: 1 });
    
    // Return early if no interviews
    if (!interviews || interviews.length === 0) {
      return res.json({ 
        success: true, 
        data: { 
          totalInterviews: 0,
          overallScore: 0,
          technicalScore: 0,
          communicationScore: 0,
          confidenceScore: 0,
          performanceTrend: 'Stable',
          strongTopics: [],
          weakTopics: [],
          improvedSkills: [],
          stagnantSkills: [],
          answerComparison: [],
          recommendations: [
            "📚 Complete your first mock interview to get personalized recommendations",
            "🎤 Practice with AI interviewer to assess your skills",
            "📊 More interviews = better analytics"
          ],
          interviewReadiness: 0,
          improvement: '0%'
        } 
      });
    }
    
    // Calculate scores
    const overallScores = interviews.map(i => i.overallScore || 0);
    const technicalScores = interviews.map(i => i.technicalScore || 0);
    const communicationScores = interviews.map(i => i.communicationScore || 0);
    const confidenceScores = interviews.map(i => i.confidenceScore || 0);
    
    const overallScore = Math.round(overallScores.reduce((a, b) => a + b, 0) / overallScores.length);
    const technicalScore = Math.round(technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length);
    const communicationScore = Math.round(communicationScores.reduce((a, b) => a + b, 0) / communicationScores.length);
    const confidenceScore = Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length);
    
    // Performance trend
    const { trend, improvement } = calculatePerformanceTrend(overallScores);
    
    // Collect all answers
    const allAnswers = interviews.flatMap(i => i.answers || []);
    const { strongTopics, weakTopics } = identifyTopics(allAnswers);
    const { improvedSkills, stagnantSkills } = analyzeSkillGrowth(interviews);
    
    // Answer comparison from latest interview
    const latestInterview = interviews[interviews.length - 1];
    const answerComparison = compareAnswers(latestInterview.answers || []);
    
    // Recommendations
    const recommendations = generateRecommendations(weakTopics, stagnantSkills, overallScore);
    
    // Interview readiness score
    const interviewReadiness = Math.round(
      (overallScore * 0.4) + (technicalScore * 0.3) + (communicationScore * 0.2) + (confidenceScore * 0.1)
    );
    
    res.json({
      success: true,
      data: {
        totalInterviews: interviews.length,
        overallScore,
        technicalScore,
        communicationScore,
        confidenceScore,
        performanceTrend: trend,
        strongTopics,
        weakTopics,
        improvedSkills,
        stagnantSkills,
        answerComparison,
        recommendations,
        interviewReadiness,
        improvement: improvement + '%'
      }
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Submit Interview Session
export const submitInterviewSession = async (req, res) => {
  try {
    const sessionData = req.body;
    
    if (!sessionData.interviewId || !sessionData.candidateId) {
      return res.status(400).json({ error: 'interviewId and candidateId are required' });
    }
    
    const newSession = new InterviewSession(sessionData);
    await newSession.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Interview session saved',
      interviewId: sessionData.interviewId
    });
    
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get Interview History
export const getInterviewHistory = async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    if (!candidateId) {
      return res.status(400).json({ error: 'candidateId is required' });
    }
    
    const interviews = await InterviewSession.find({ candidateId }).sort({ date: -1 });
    
    res.json({
      success: true,
      interviews: interviews.map(i => ({
        id: i.interviewId,
        date: i.date,
        type: i.type,
        overallScore: i.overallScore,
        technicalScore: i.technicalScore,
        communicationScore: i.communicationScore,
        confidenceScore: i.confidenceScore,
        answersCount: i.answers?.length || 0
      }))
    });
    
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: error.message });
  }
};
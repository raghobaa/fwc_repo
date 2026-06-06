import SkillGap from "../models/SkillGap.js";
import User from "../models/User.js";

export const analyzeSkillGap = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    
    if (!jobDescription) {
      return res.status(400).json({ error: "Job description is required" });
    }
    
    // Get user's skills from database
    const user = await User.findById(req.user._id);
    const userSkills = user.skills || [];
    const userSkillNames = userSkills.map(s => s.name.toLowerCase());
    const userTechnicalSkills = (user.technicalSkills || []).map(s => s.toLowerCase());
    const allUserSkills = [...new Set([...userSkillNames, ...userTechnicalSkills])];
    
    console.log("User skills:", allUserSkills);
    
    // Simple keyword extraction from job description
    const commonSkills = ["javascript", "react", "node.js", "python", "java", "sql", "mongodb", "aws", "docker", "git", "html", "css", "typescript", "angular", "vue", "php", "c++", "c#", "spring", "django", "flask"];
    
    // Extract skills from job description
    const lowerDesc = jobDescription.toLowerCase();
    const requiredSkills = commonSkills.filter(skill => lowerDesc.includes(skill));
    
    // If no skills found, use default
    const finalRequiredSkills = requiredSkills.length > 0 ? requiredSkills : ["JavaScript", "React", "Node.js", "Python", "SQL"];
    
    // Compare user skills with required skills
    const matchedSkills = finalRequiredSkills.filter(skill => allUserSkills.includes(skill));
    const missingSkills = finalRequiredSkills.filter(skill => !allUserSkills.includes(skill));
    
    // Calculate match score
    const matchScore = finalRequiredSkills.length > 0 
      ? Math.round((matchedSkills.length / finalRequiredSkills.length) * 100)
      : 50;
    
    // Generate recommendations
    let recommendations = [];
    if (missingSkills.length > 0) {
      recommendations = missingSkills.slice(0, 4).map(skill => `Learn ${skill.charAt(0).toUpperCase() + skill.slice(1)} to improve job fit`);
    } else {
      recommendations = [
        "Great! Your skills match well!",
        "Keep updating your portfolio with relevant projects",
        "Practice coding challenges daily",
        "Prepare for behavioral interview questions"
      ];
    }
    
    // Generate learning roadmap
    const learningRoadmap = missingSkills.slice(0, 4).map((skill, index) => ({
      topic: skill.charAt(0).toUpperCase() + skill.slice(1),
      priority: index === 0 ? "High" : index === 1 ? "Medium" : "Low",
      estimatedHours: Math.floor(Math.random() * 20) + 10,
      resources: [
        `Coursera: ${skill.charAt(0).toUpperCase() + skill.slice(1)} Course`,
        `YouTube: ${skill.charAt(0).toUpperCase() + skill.slice(1)} Tutorial`,
        `Official Documentation: ${skill.charAt(0).toUpperCase() + skill.slice(1)}`
      ]
    }));
    
    // Calculate estimated time
    const totalHours = learningRoadmap.reduce((sum, item) => sum + item.estimatedHours, 0);
    const estimatedTimeToReady = totalHours > 40 ? `${Math.ceil(totalHours / 40)} months` : `${Math.ceil(totalHours / 8)} weeks`;
    
    // Extract job title (simple extraction)
    let jobTitle = "Software Developer";
    const titleMatch = jobDescription.match(/(?:Title:|Position:|Role:)?\s*([A-Za-z\s]+(?:Developer|Engineer|Architect|Analyst|Manager))/i);
    if (titleMatch) {
      jobTitle = titleMatch[1].trim();
    }
    
    // Save to database (optional, continue even if fails)
    try {
      const skillGap = new SkillGap({
        userId: req.user._id,
        jobTitle: jobTitle,
        jobDescription: jobDescription.substring(0, 500),
        matchScore,
        matchedSkills,
        missingSkills,
        missingTechnologies: [],
        experienceGap: "Not specified",
        certificationGap: [],
        recommendations,
        learningRoadmap,
        estimatedTimeToReady
      });
      await skillGap.save();
    } catch (dbError) {
      console.error("DB save error (non-critical):", dbError.message);
    }
    
    res.json({
      success: true,
      jobTitle: jobTitle,
      matchScore,
      matchedSkills,
      missingSkills,
      missingTechnologies: [],
      experienceRequired: "Not specified",
      certificationsRequired: [],
      recommendations,
      learningRoadmap,
      estimatedTimeToReady,
      message: `You are ${matchScore}% ready for this role.`
    });
    
  } catch (error) {
    console.error("Error analyzing skill gap:", error);
    res.status(500).json({ error: "Failed to analyze job description: " + error.message });
  }
};

export const getAnalysisHistory = async (req, res) => {
  try {
    const history = await SkillGap.find({ userId: req.user._id })
      .sort({ analyzedAt: -1 })
      .limit(10);
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};
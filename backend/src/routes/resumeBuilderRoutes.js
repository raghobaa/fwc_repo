import express from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

// Initialize Gemini AI
let genAI = null;
if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'your-gemini-api-key-here') {
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  console.log('✅ Gemini AI initialized');
} else {
  console.log('⚠️ Gemini AI not configured, using enhanced mock data');
}

// Helper function to extract text from PDF
async function extractTextFromPDF(filePath) {
  try {
    // Dynamic import for pdf-parse
    const pdfParse = (await import('pdf-parse')).default;
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  } catch (error) {
    console.error("PDF extraction error:", error);
    return "";
  }
}

// Helper function to extract text from Word documents
async function extractTextFromWord(filePath) {
  try {
    const mammoth = (await import('mammoth')).default;
    const dataBuffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return result.value;
  } catch (error) {
    console.error("Word extraction error:", error);
    return "";
  }
}

async function extractTextFromFile(filePath, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      return await extractTextFromPDF(filePath);
    } else if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await extractTextFromWord(filePath);
    }
    return "";
  } catch (error) {
    console.error("Text extraction error:", error);
    return "";
  }
}

function extractKeywords(text) {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 
    'do', 'does', 'did', 'doing', 'will', 'would', 'should', 'could', 'may', 'might', 'must'
  ]);
  
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const freq = {};
  words.forEach(w => { 
    if (!stopWords.has(w) && w.length > 2) {
      freq[w] = (freq[w] || 0) + 1;
    }
  });
  
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([word]) => word);
}

function calculateKeywordMatch(resumeText, jobDescription) {
  if (!jobDescription || jobDescription.trim() === "") {
    return { 
      score: 75, 
      matched: extractKeywords(resumeText).slice(0, 12), 
      missing: [] 
    };
  }
  
  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);
  const matched = jobKeywords.filter(kw => resumeKeywords.includes(kw));
  const missing = jobKeywords.filter(kw => !resumeKeywords.includes(kw)).slice(0, 10);
  
  const score = jobKeywords.length > 0 ? Math.round((matched.length / jobKeywords.length) * 100) : 70;
  return { 
    score: Math.min(100, Math.max(0, score)), 
    matched: matched.slice(0, 12), 
    missing 
  };
}

function assessFormatting(text) {
  const issues = [];
  if (text.includes('|') && text.includes('---')) {
    issues.push('Tables detected - may cause parsing issues');
  }
  if (text.match(/[^\x00-\x7F]/g)?.length > 100) {
    issues.push('Unusual characters detected');
  }
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  if (lines.length < 20) {
    issues.push('Very short document - consider adding more details');
  }
  if (lines.length > 150) {
    issues.push('Document length may exceed 2 pages - consider condensing');
  }
  return issues;
}

// Resume generation endpoint
router.post("/generate", async (req, res) => {
  try {
    console.log("📝 Generating resume...");
    const candidate = req.body;

    let formattedResume = {
      name: candidate.name || "",
      email: candidate.email || "",
      phone: candidate.phone || "",
      linkedin: candidate.linkedin || "",
      github: candidate.github || "",
      summary: candidate.professionalSummary || null,
      education: candidate.education || null,
      experience: candidate.experience || null,
      projects: candidate.projects || null,
      skills: candidate.skills || null,
      certifications: candidate.certifications || null,
    };

    // Use Gemini AI to enhance resume if available
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `Enhance this resume content to be more professional and ATS-friendly. Return ONLY a JSON object with these fields: summary, education, experience, projects, skills, certifications. Keep the original meaning but improve wording and formatting.

Original resume:
Name: ${candidate.name}
Professional Summary: ${candidate.professionalSummary || "Not provided"}
Education: ${candidate.education || "Not provided"}
Experience: ${candidate.experience || "Not provided"}
Projects: ${candidate.projects || "Not provided"}
Skills: ${candidate.skills || "Not provided"}
Certifications: ${candidate.certifications || "Not provided"}

Return JSON format: {"summary": "...", "education": "...", "experience": "...", "projects": "...", "skills": "...", "certifications": "..."}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const enhanced = JSON.parse(jsonMatch[0]);
          formattedResume = { ...formattedResume, ...enhanced };
          console.log("✅ AI enhancement applied");
        }
      } catch (aiError) {
        console.error("AI enhancement failed:", aiError);
      }
    }

    // Fill in missing fields with generated content
    if (!formattedResume.summary) {
      formattedResume.summary = `Experienced professional with expertise in ${formattedResume.skills || "software development"}. Proven track record of delivering high-quality solutions and leading successful projects.`;
    }
    
    if (!formattedResume.education) {
      formattedResume.education = "Bachelor's Degree in Computer Science or related field\nRelevant coursework and projects demonstrating technical expertise";
    }
    
    if (!formattedResume.experience) {
      formattedResume.experience = "• Demonstrated experience in software development and project delivery\n• Strong problem-solving and analytical skills\n• Excellent team collaboration and communication abilities\n• Proven track record of meeting deadlines and exceeding expectations";
    }
    
    if (!formattedResume.skills) {
      formattedResume.skills = "JavaScript, React, Node.js, Python, SQL, Git, Agile Methodologies, REST APIs";
    }

    if (!formattedResume.projects) {
      formattedResume.projects = "• Developed full-stack web applications using modern frameworks\n• Implemented responsive designs and optimized performance\n• Collaborated with cross-functional teams to deliver features";
    }

    console.log("✅ Resume generated successfully");
    res.json(formattedResume);
  } catch (error) {
    console.error("Error in resume generation:", error);
    res.status(500).json({ error: "Resume generation failed: " + error.message });
  }
});

// ATS Analysis endpoint
router.post("/analyze-ats", upload.single("resume"), async (req, res) => {
  try {
    console.log("🔍 Starting ATS analysis...");
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    const filename = req.file.originalname;
    const jobDescription = req.body.jobDescription || "";
    
    console.log(`📄 Analyzing file: ${filename}`);
    
    // Extract text from file
    const resumeText = await extractTextFromFile(filePath, mimeType);
    
    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.error("Error deleting temp file:", unlinkError);
    }
    
    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: "Could not extract text from file. Please ensure the file is not corrupted." });
    }
    
    console.log(`✅ Text extracted: ${resumeText.length} characters`);
    
    // Calculate keyword matching
    const keywordResult = calculateKeywordMatch(resumeText, jobDescription);
    const formatIssues = assessFormatting(resumeText);
    
    // Calculate individual scores
    const keywordMatchScore = keywordResult.score;
    const skillsAlignmentScore = Math.min(95, Math.max(45, 65 + Math.floor(Math.random() * 20)));
    const experienceScore = Math.min(92, Math.max(40, 60 + Math.floor(Math.random() * 25)));
    const formattingScore = Math.min(98, 85 - formatIssues.length * 8);
    const structureScore = Math.min(90, 75 + Math.floor(Math.random() * 15));
    
    // Overall weighted score
    let overallScore = Math.round(
      keywordMatchScore * 0.35 +
      skillsAlignmentScore * 0.25 +
      experienceScore * 0.2 +
      formattingScore * 0.1 +
      structureScore * 0.1
    );
    
    overallScore = Math.min(100, Math.max(0, overallScore));
    
    // Generate AI feedback if available
    let aiFeedback = "";
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `As an ATS (Applicant Tracking System) expert, analyze this resume and provide 2-3 sentences of actionable, specific feedback. Score: ${overallScore}%. Keep it concise and professional.

Resume preview (first 1500 chars): ${resumeText.substring(0, 1500)}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        aiFeedback = response.text();
        console.log("✅ AI feedback generated");
      } catch (aiError) {
        console.error("AI feedback generation failed:", aiError);
      }
    }
    
    // Generate improvements list based on scores
    const improvements = [];
    if (overallScore < 80) improvements.push("Add 5-10 more industry-specific keywords from job descriptions");
    if (overallScore < 75) improvements.push("Include measurable achievements with numbers and metrics (e.g., 'Increased sales by 30%')");
    if (keywordMatchScore < 70) improvements.push("Tailor your resume to match job description keywords more closely");
    improvements.push("Use standard section headings (Experience, Education, Skills) for better ATS parsing");
    if (formatIssues.length > 0) improvements.push("Simplify formatting - remove tables, columns, and unusual characters");
    if (resumeText.length < 1000) improvements.push("Add more details to your work experience and project descriptions");
    if (improvements.length < 4) improvements.push("Quantify your achievements with specific numbers and results");
    
    // Determine strong and weak sections
    const strongSections = [];
    const weakSections = [];
    
    if (resumeText.toLowerCase().includes("skill")) strongSections.push("Skills");
    if (resumeText.toLowerCase().includes("project")) strongSections.push("Projects");
    if (resumeText.toLowerCase().includes("experience") || resumeText.toLowerCase().includes("work")) strongSections.push("Experience");
    
    if (keywordMatchScore < 65) weakSections.push("Keyword Optimization");
    if (!resumeText.toLowerCase().includes("achievement")) weakSections.push("Achievements");
    if (formatIssues.length > 0) weakSections.push("Formatting");
    
    const atsResult = {
      score: overallScore,
      overallScore: overallScore,
      keywordMatchScore: keywordMatchScore,
      skillsAlignmentScore: skillsAlignmentScore,
      experienceScore: experienceScore,
      formattingScore: formattingScore,
      structureScore: structureScore,
      feedback: aiFeedback || (
        overallScore >= 80 ? "Excellent resume! Well-optimized for ATS systems. Your formatting and keyword usage are strong." :
        overallScore >= 60 ? "Good foundation. Your resume has potential but needs optimization for better ATS performance." :
        "Your resume needs significant improvement. Focus on keyword optimization, clear formatting, and quantifiable achievements."
      ),
      improvements: improvements.slice(0, 6),
      missingKeywords: keywordResult.missing.slice(0, 8),
      matchedKeywords: keywordResult.matched.slice(0, 12),
      strongSections: strongSections.length > 0 ? strongSections : ["Content Structure"],
      weakSections: weakSections.length > 0 ? weakSections : ["Consider adding more measurable results"],
      recommendedSkills: ["TypeScript/JavaScript", "Cloud Services (AWS/Azure)", "Docker/Kubernetes", "CI/CD Pipeline", "GraphQL/REST APIs", "Agile/Scrum Methodology"].slice(0, 5),
      formatIssues: formatIssues,
      wordCount: resumeText.split(/\s+/).length
    };
    
    console.log(`✅ ATS analysis complete. Score: ${overallScore}%`);
    res.json(atsResult);
  } catch (error) {
    console.error("ATS Analysis error:", error);
    res.status(500).json({ error: "ATS analysis failed: " + error.message });
  }
});

export default router;
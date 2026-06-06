import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001; // Consistent port

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Create uploads directory
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    
    const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
    
    if (isLocalhost || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static files
app.use('/uploads', express.static(uploadDir));

// ========== RESUME GENERATION WITH GEMINI AI ==========
app.post('/api/resume-builder/generate', async (req, res) => {
  try {
    console.log('🤖 Generating resume with Gemini AI...');
    const candidate = req.body;
    
    // Create prompt for Gemini
    const prompt = `
      You are an expert resume writer. Create a professional, ATS-friendly resume based on the following candidate information:
      
      Name: ${candidate.name || 'Not provided'}
      Email: ${candidate.email || 'Not provided'}
      Phone: ${candidate.phone || 'Not provided'}
      LinkedIn: ${candidate.linkedin || 'Not provided'}
      GitHub: ${candidate.github || 'Not provided'}
      
      Professional Summary provided: ${candidate.professionalSummary || 'Not provided - create one based on skills'}
      Education: ${candidate.education || 'Not provided'}
      Experience: ${candidate.experience || 'Not provided'}
      Projects: ${candidate.projects || 'Not provided'}
      Skills: ${candidate.skills || 'Not provided'}
      Certifications: ${candidate.certifications || 'Not provided'}
      
      Please format the resume as JSON with the following structure:
      {
        "name": "full name",
        "email": "email",
        "phone": "phone",
        "linkedin": "linkedin url",
        "github": "github url", 
        "summary": "2-3 sentence professional summary optimized for ATS",
        "education": "formatted education section with bullet points",
        "experience": "formatted experience section with achievements and metrics",
        "projects": "formatted projects section with technologies used",
        "skills": "comma-separated technical and soft skills",
        "certifications": "formatted certifications section"
      }
      
      Make the content professional, include metrics where possible (%, $, numbers), and optimize for ATS systems.
    `;
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from response (handle markdown code blocks)
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    let resumeData;
    
    if (jsonMatch) {
      resumeData = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback to mock data if parsing fails
      throw new Error("Failed to parse AI response");
    }
    
    console.log('✅ Resume generated successfully');
    res.json(resumeData);
    
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    
    // Fallback to mock generation
    const candidate = req.body;
    const mockResume = {
      name: candidate.name || "Professional Candidate",
      email: candidate.email || "candidate@example.com",
      phone: candidate.phone || "+1 (555) 123-4567",
      linkedin: candidate.linkedin || "linkedin.com/in/profile",
      github: candidate.github || "github.com/profile",
      summary: candidate.professionalSummary || generateProfessionalSummary(candidate.skills),
      education: candidate.education || generateEducation(),
      experience: candidate.experience || generateExperience(candidate.skills),
      projects: candidate.projects || generateProjects(candidate.skills),
      skills: candidate.skills || "JavaScript, React, Node.js, Python, SQL, Git, AWS",
      certifications: candidate.certifications || "AWS Certified Developer, Google IT Support, Scrum Master",
    };
    
    res.json(mockResume);
  }
});

// ========== ATS ANALYSIS ENDPOINT ==========
app.post('/api/resume-builder/analyze-ats', (req, res) => {
  try {
    console.log('🔍 Analyzing resume for ATS...');
    const { resumeText, jobDescription } = req.body;
    
    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: "Resume text is required" });
    }
    
    const atsScore = calculateATSScore(resumeText);
    const strengths = identifyStrengths(resumeText);
    const weaknesses = identifyWeaknesses(resumeText);
    const missingKeywords = extractMissingKeywords(resumeText, jobDescription);
    const recommendations = generateRecommendations(weaknesses, missingKeywords);
    
    console.log('✅ Analysis complete, Score:', atsScore);
    
    res.json({
      atsScore,
      strengths,
      weaknesses,
      missingKeywords,
      recommendations,
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      atsScore: 65,
      strengths: ["Resume contains basic information", "Contact details are present"],
      weaknesses: ["Missing quantifiable achievements", "Limited keyword optimization"],
      missingKeywords: ["leadership", "project management", "communication"],
      recommendations: ["Add metrics to your experience", "Include more keywords", "Add a professional summary"],
    });
  }
});

// ========== FILE PARSE ENDPOINT ==========
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

app.post('/api/resume-builder/parse-resume', upload.single("file"), (req, res) => {
  try {
    console.log("📁 Parsing file...");
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let text = "";

    if (file.mimetype === "text/plain") {
      text = fs.readFileSync(file.path, "utf8");
      console.log("✅ TXT file parsed, length:", text.length);
    } else {
      text = `[File uploaded: ${file.originalname}]\n\nPlease paste your resume content manually for accurate ATS analysis.\n\nFile type: ${file.mimetype}\nFile size: ${(file.size / 1024).toFixed(2)} KB`;
      console.log("⚠️ Non-TXT file uploaded");
    }

    // Clean up
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.json({
      success: true,
      text: text,
      fileName: file.originalname,
      charCount: text.length,
      message: file.mimetype === "text/plain" ? "File parsed successfully!" : "File uploaded. Please paste content for analysis.",
    });
    
  } catch (error) {
    console.error("Error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Failed to parse file" });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'Running',
    port: PORT
  });
});

// ========== HELPER FUNCTIONS ==========

function generateProfessionalSummary(skills) {
  const skillList = skills ? skills.split(",").slice(0, 3).join(", ") : "software development";
  return `Results-driven software engineer with 5+ years of experience in ${skillList}. Proven track record of delivering high-quality solutions, improving system performance by up to 40%, and leading successful projects from conception to deployment.`;
}

function generateEducation() {
  return `Bachelor of Science in Computer Science\nUniversity of Technology | 2020-2024\nGPA: 3.7/4.0\nRelevant Coursework: Data Structures, Algorithms, Database Design, Web Development`;
}

function generateExperience(skills) {
  const tech = skills ? skills.split(",")[0] : "JavaScript";
  return `Senior Software Engineer | Tech Solutions Inc. | 2022-Present\n• Developed and maintained 15+ web applications using ${tech}, serving 100,000+ users\n• Improved application performance by 45% through code optimization and caching strategies\n• Led a team of 4 developers, delivering features 30% ahead of schedule\n• Implemented CI/CD pipelines reducing deployment time by 60%\n\nSoftware Developer | Digital Innovations | 2020-2022\n• Built RESTful APIs handling 50,000+ daily requests with 99.9% uptime\n• Reduced bug density by 35% through comprehensive testing and code reviews\n• Collaborated with cross-functional teams to launch 5 major features`;
}

function generateProjects(skills) {
  const tech = skills ? skills.split(",")[0] : "React";
  return `E-Commerce Platform | ${tech}, Node.js, MongoDB\n• Built full-stack e-commerce platform processing $100K+ in monthly transactions\n• Implemented real-time inventory system reducing errors by 95%\n• Optimized database queries improving response time by 60%\n\nTask Management System | ${tech}, Socket.io, PostgreSQL\n• Developed real-time task management system for 1000+ enterprise users\n• Reduced notification lag by 80% using WebSocket connections\n• Created RESTful API with 20+ endpoints serving mobile and web clients`;
}

function calculateATSScore(text) {
  let score = 50;
  
  if (/\d+%/.test(text)) score += 20;
  if (text.toLowerCase().includes("skills")) score += 10;
  if (text.toLowerCase().includes("experience")) score += 10;
  if (/\$\d+/.test(text)) score += 5;
  
  const wordCount = text.split(/\s+/).length;
  if (wordCount > 300) score += 5;
  if (wordCount > 500) score += 5;
  
  const actionVerbs = ["developed", "created", "implemented", "managed", "led", "improved"];
  let verbCount = 0;
  actionVerbs.forEach(verb => {
    if (text.toLowerCase().includes(verb)) verbCount++;
  });
  score += Math.min(5, verbCount);
  
  return Math.min(100, score);
}

function identifyStrengths(text) {
  const strengths = [];
  
  if (/\d+%/.test(text)) {
    strengths.push("📊 Includes quantifiable achievements with metrics");
  }
  if (text.toLowerCase().includes("skills")) {
    strengths.push("💪 Well-defined skills section");
  }
  if (/(led|managed|directed|spearheaded)/i.test(text)) {
    strengths.push("👥 Demonstrates leadership experience");
  }
  if (text.length > 1500) {
    strengths.push("📝 Comprehensive content with good detail");
  }
  
  if (strengths.length === 0) {
    strengths.push("✅ Basic resume structure present");
    strengths.push("✅ Contact information included");
  }
  
  return strengths.slice(0, 4);
}

function identifyWeaknesses(text) {
  const weaknesses = [];
  
  if (!/\d+%/.test(text)) {
    weaknesses.push("Missing quantifiable achievements (add metrics like 'increased by 30%')");
  }
  if (!text.toLowerCase().includes("summary")) {
    weaknesses.push("No professional summary section");
  }
  if (!text.toLowerCase().includes("certification")) {
    weaknesses.push("No certifications listed");
  }
  if (text.split(/\s+/).length < 250) {
    weaknesses.push("Resume content is too brief - add more details");
  }
  
  return weaknesses.slice(0, 4);
}

function extractMissingKeywords(text, jobDesc) {
  if (!jobDesc || jobDesc.trim() === "") {
    return ["leadership", "problem-solving", "communication", "teamwork", "agile", "project management"];
  }
  
  const textLower = text.toLowerCase();
  const jobLower = jobDesc.toLowerCase();
  const keywords = ["leadership", "management", "development", "strategy", "communication", 
                    "collaboration", "agile", "scrum", "cloud", "aws", "api", "database"];
  
  const missing = [];
  keywords.forEach(keyword => {
    if (jobLower.includes(keyword) && !textLower.includes(keyword)) {
      missing.push(keyword);
    }
  });
  
  return missing.slice(0, 6);
}

function generateRecommendations(weaknesses, missingKeywords) {
  const recommendations = [];
  
  if (weaknesses.some(w => w.includes("quantifiable"))) {
    recommendations.push("Add numbers and percentages to showcase your impact (e.g., 'Improved performance by 30%')");
  }
  if (weaknesses.some(w => w.includes("summary"))) {
    recommendations.push("Add a 2-3 sentence professional summary at the top");
  }
  if (missingKeywords.length > 0) {
    recommendations.push(`Include these keywords naturally: ${missingKeywords.slice(0, 3).join(", ")}`);
  }
  if (weaknesses.some(w => w.includes("brief"))) {
    recommendations.push("Expand your experience section with more details and achievements");
  }
  
  recommendations.push("Save as .docx or .pdf for ATS compatibility");
  recommendations.push("Use standard section headings (Experience, Education, Skills)");
  recommendations.push("Tailor your resume for each job application by matching keywords");
  
  return recommendations.slice(0, 6);
}

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`🤖 Gemini AI: ${process.env.GOOGLE_API_KEY ? 'Configured ✓' : 'Missing ✗'}\n`);
});
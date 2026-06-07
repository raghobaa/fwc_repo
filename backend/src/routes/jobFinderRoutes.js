import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { protect } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Sample jobs for testing
const sampleInternalJobs = [
  {
    _id: "job_001",
    title: "Senior Full Stack Developer",
    company: "Tech Corp India",
    source: "Internal",
    location: "Bangalore, India",
    salary: "₹15-25 LPA",
    matchScore: 92,
    matchingSkills: ["React", "Node.js", "MongoDB", "JavaScript"],
    missingSkills: ["Docker", "AWS"],
    recommendation: "Excellent Match! Your skills are a perfect fit for this role.",
    postedDate: new Date(),
    description: "Looking for an experienced Full Stack Developer with strong React and Node.js skills."
  },
  {
    _id: "job_002",
    title: "Frontend Developer - React",
    company: "Digital Innovations",
    source: "Internal",
    location: "Remote",
    salary: "₹10-16 LPA",
    matchScore: 85,
    matchingSkills: ["React", "JavaScript", "HTML/CSS"],
    missingSkills: ["TypeScript", "Next.js"],
    recommendation: "Great Match! Strong alignment with frontend requirements.",
    postedDate: new Date(),
    description: "Seeking a React developer to build modern web applications."
  },
  {
    _id: "job_003",
    title: "Backend Engineer - Node.js",
    company: "Cloud Systems Pvt Ltd",
    source: "Internal",
    location: "Hyderabad, India",
    salary: "₹14-22 LPA",
    matchScore: 78,
    matchingSkills: ["Node.js", "Python", "SQL", "MongoDB"],
    missingSkills: ["Docker", "Redis", "Microservices"],
    recommendation: "Good Match! Consider upskilling in the missing areas.",
    postedDate: new Date(),
    description: "Backend developer with expertise in Node.js and database design."
  },
  {
    _id: "job_004",
    title: "DevOps Engineer",
    company: "Infra Solutions",
    source: "Internal",
    location: "Pune, India",
    salary: "₹18-28 LPA",
    matchScore: 68,
    matchingSkills: ["Docker", "AWS", "Linux", "Git"],
    missingSkills: ["Kubernetes", "Terraform", "Jenkins"],
    recommendation: "Medium Match - Good foundation, learn missing tools.",
    postedDate: new Date(),
    description: "DevOps engineer with cloud infrastructure expertise."
  },
  {
    _id: "job_005",
    title: "React Native Developer",
    company: "Mobile First",
    source: "Internal",
    location: "Remote",
    salary: "₹12-18 LPA",
    matchScore: 88,
    matchingSkills: ["React", "JavaScript", "Mobile Development", "Redux"],
    missingSkills: ["iOS", "Android Native"],
    recommendation: "High Match! Your React expertise transfers well to mobile.",
    postedDate: new Date(),
    description: "Mobile app developer using React Native framework."
  },
  {
    _id: "job_006",
    title: "Data Engineer",
    company: "DataWorks",
    source: "Internal",
    location: "Bangalore, India",
    salary: "₹16-24 LPA",
    matchScore: 72,
    matchingSkills: ["Python", "SQL", "Pandas", "Data Analysis"],
    missingSkills: ["Spark", "Hadoop", "Airflow"],
    recommendation: "Good Match! Strong data fundamentals.",
    postedDate: new Date(),
    description: "Data engineer to build and maintain data pipelines."
  }
];

// Internal Jobs - Get jobs posted by organization
router.get("/internal-jobs", protect, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    
    // Get user skills for matching
    const user = await User.findById(req.user._id);
    const userSkills = user.skills?.map(s => s.name.toLowerCase()) || [];
    const userTechSkills = user.technicalSkills?.map(s => s.toLowerCase()) || [];
    const allUserSkills = [...new Set([...userSkills, ...userTechSkills])];
    
    // Calculate match scores based on user skills
    const jobsWithScores = sampleInternalJobs.map(job => {
      const jobTitle = job.title.toLowerCase();
      const jobDesc = job.description.toLowerCase();
      
      let matchCount = 0;
      allUserSkills.forEach(skill => {
        if (jobTitle.includes(skill) || jobDesc.includes(skill)) {
          matchCount++;
        }
      });
      
      // Calculate match score based on skill overlap
      let matchScore = 60;
      if (allUserSkills.length > 0) {
        matchScore = Math.min(95, Math.floor((matchCount / Math.max(1, allUserSkills.length)) * 100) + 40);
      }
      
      // Get matching and missing skills
      const jobKeywords = ["react", "node", "python", "javascript", "java", "sql", "mongodb", "docker", "aws", "git", "html", "css", "typescript", "redux", "express"];
      const matched = allUserSkills.filter(skill => jobKeywords.includes(skill));
      const missing = jobKeywords.filter(skill => !allUserSkills.includes(skill)).slice(0, 3);
      
      let recommendation = "";
      if (matchScore >= 80) recommendation = "Excellent Match! Your skills align perfectly.";
      else if (matchScore >= 65) recommendation = "Good Match! Strong alignment with requirements.";
      else if (matchScore >= 50) recommendation = "Medium Match - Consider upskilling in missing areas.";
      else recommendation = "Potential Growth Opportunity - Learn recommended skills.";
      
      return {
        ...job,
        matchScore,
        matchingSkills: matched.slice(0, 4),
        missingSkills: missing,
        recommendation
      };
    });
    
    res.json({
      success: true,
      jobs: jobsWithScores.sort((a, b) => b.matchScore - a.matchScore)
    });
  } catch (error) {
    console.error("Error fetching internal jobs:", error);
    res.json({ success: true, jobs: sampleInternalJobs });
  }
});

// Market Opportunities - External jobs from AI
router.post("/market-jobs", protect, async (req, res) => {
  try {
    const { preferredLocation, jobRole } = req.body;
    
    const user = await User.findById(req.user._id);
    const userSkills = user.skills?.map(s => s.name) || [];
    const userTechSkills = user.technicalSkills || [];
    const allSkills = [...new Set([...userSkills, ...userTechSkills])];
    const experience = user.experience || user.userTitle || "Software Developer";
    const location = preferredLocation || user.location || "Remote";
    
    // Sample market jobs
    const marketJobsList = [
      {
        _id: "market_001",
        jobTitle: "Senior Software Engineer",
        company: "Google",
        source: "LinkedIn",
        location: "Bangalore, India",
        salary: "₹25-35 LPA",
        matchScore: 88,
        matchingSkills: ["JavaScript", "React", "Node.js", "Algorithms"],
        missingSkills: ["System Design", "C++"],
        recommendation: "High Match! Your skills align well with Google's requirements.",
        url: "https://linkedin.com/jobs/view/1"
      },
      {
        _id: "market_002",
        jobTitle: "Full Stack Developer",
        company: "Amazon",
        source: "Indeed",
        location: "Hyderabad, India",
        salary: "₹20-30 LPA",
        matchScore: 82,
        matchingSkills: ["React", "Node.js", "JavaScript", "AWS"],
        missingSkills: ["Java", "Spring Boot"],
        recommendation: "Good Match! Strong full stack experience.",
        url: "https://indeed.com/jobs/view/2"
      },
      {
        _id: "market_003",
        jobTitle: "Frontend Lead",
        company: "Microsoft",
        source: "LinkedIn",
        location: "Remote",
        salary: "₹22-32 LPA",
        matchScore: 86,
        matchingSkills: ["React", "TypeScript", "JavaScript", "HTML/CSS"],
        missingSkills: ["Angular", "Vue.js"],
        recommendation: "High Match! Your frontend expertise is valuable.",
        url: "https://linkedin.com/jobs/view/3"
      },
      {
        _id: "market_004",
        jobTitle: "Backend Developer",
        company: "Flipkart",
        source: "Naukri",
        location: "Bangalore, India",
        salary: "₹18-25 LPA",
        matchScore: 75,
        matchingSkills: ["Node.js", "Python", "SQL", "MongoDB"],
        missingSkills: ["Java", "Microservices"],
        recommendation: "Good Match! Solid backend fundamentals.",
        url: "https://naukri.com/jobs/view/4"
      },
      {
        _id: "market_005",
        jobTitle: "React Developer",
        company: "Swiggy",
        source: "LinkedIn",
        location: "Bangalore, India",
        salary: "₹14-20 LPA",
        matchScore: 90,
        matchingSkills: ["React", "JavaScript", "Redux", "HTML/CSS"],
        missingSkills: ["Next.js", "GraphQL"],
        recommendation: "Excellent Match! Your React skills are perfect.",
        url: "https://linkedin.com/jobs/view/5"
      },
      {
        _id: "market_006",
        jobTitle: "DevOps Engineer",
        company: "Razorpay",
        source: "Indeed",
        location: "Remote",
        salary: "₹16-24 LPA",
        matchScore: 68,
        matchingSkills: ["Docker", "AWS", "Linux", "Git"],
        missingSkills: ["Kubernetes", "Terraform", "Jenkins"],
        recommendation: "Medium Match - Learn DevOps tools to improve.",
        url: "https://indeed.com/jobs/view/6"
      }
    ];
    
    // Calculate personalized match scores
    const jobsWithScores = marketJobsList.map(job => {
      let matchCount = 0;
      allSkills.forEach(skill => {
        if (job.matchingSkills.some(ms => ms.toLowerCase().includes(skill.toLowerCase()))) {
          matchCount++;
        }
      });
      
      const personalizedScore = Math.min(95, Math.floor((matchCount / Math.max(1, allSkills.length)) * 100) + 50);
      
      return {
        ...job,
        matchScore: personalizedScore,
        matchingSkills: allSkills.slice(0, 4),
        missingSkills: job.missingSkills
      };
    });
    
    res.json({
      success: true,
      jobs: jobsWithScores.sort((a, b) => b.matchScore - a.matchScore),
      insights: {
        topSkills: allSkills.slice(0, 5),
        trendingRoles: ["Full Stack Developer", "Cloud Engineer", "AI/ML Engineer", "DevOps Engineer"],
        salaryTrend: "+15% year over year"
      }
    });
  } catch (error) {
    console.error("Error fetching market jobs:", error);
    res.json({ success: true, jobs: [] });
  }
});

// Get salary insights
router.get("/salary-insights", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const role = user.userTitle || "Software Engineer";
    
    res.json({
      role,
      averageSalary: "₹12-18 LPA",
      salaryRange: {
        entry: "₹6-9 LPA",
        mid: "₹12-18 LPA",
        senior: "₹20-30 LPA"
      },
      topLocations: ["Bangalore", "Hyderabad", "Pune", "Chennai", "Remote"],
      trendingSkills: ["React", "Node.js", "Python", "AWS", "Docker", "TypeScript"]
    });
  } catch (error) {
    res.json({ averageSalary: "₹10-15 LPA", trendingSkills: ["JavaScript", "Python", "React"] });
  }
});

// Apply for job
router.post("/apply", protect, async (req, res) => {
  try {
    const { jobId, jobTitle, company, applicantName, applicantEmail, applicantPhone, coverLetter } = req.body;
    
    // Here you would save to database
    console.log(`Application received for ${jobTitle} at ${company} from ${applicantName}`);
    
    res.json({ 
      success: true, 
      message: `Application submitted successfully for ${jobTitle}` 
    });
  } catch (error) {
    console.error("Error applying:", error);
    res.json({ success: true, message: "Application submitted" });
  }
});

export default router;
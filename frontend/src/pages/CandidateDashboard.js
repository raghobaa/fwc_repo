import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Target, Brain, FileText, Briefcase, 
  TrendingUp, BarChart3, Trophy, Award, Calendar, 
  Flame, PieChart, HelpCircle, LogOut,
  ArrowRight, CheckCircle, User,
  Bell, Search, Menu, X, Star, Zap, Crown,
  Camera, Save, Edit2, Mail, Phone, MapPin, 
  Linkedin, Github, Globe, GraduationCap, Code, Users,
  Upload, File, ExternalLink, Plus, Building, DollarSign,
  FolderGit2, BookOpen, Clock, Trash2, Edit, Briefcase as BriefcaseIcon,
  Video, BarChart as BarChartIcon, Activity, Target as TargetIcon
} from 'lucide-react';

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [showJobs, setShowJobs] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState("basic");
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [showAddExperienceModal, setShowAddExperienceModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Application data (will be filled by the modal)
  const [applicationData, setApplicationData] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
    resume: null
  });

  // Profile State
  const [profile, setProfile] = useState({
    _id: "",
    name: "",
    email: "",
    phone: "",
    location: "",
    title: "",
    bio: "",
    linkedin: "",
    github: "",
    portfolio: "",
    resumeUrl: "",
    avatar: "",
    technicalSkills: [],
    softSkills: [],
    education: [],
    languages: [],
    projects: [],
    certifications: [],
    workExperience: []
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    title: "",
    bio: "",
    linkedin: "",
    github: "",
    portfolio: "",
    education: [],
    technicalSkills: [],
    softSkills: [],
    languages: [],
    projects: [],
    certifications: [],
    workExperience: [],
    avatarFile: null,
    avatarPreview: null
  });

  // New Project Form
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    technologiesUsed: "",
    githubLink: "",
    role: ""
  });

  // New Certificate Form
  const [newCert, setNewCert] = useState({
    name: "",
    issuingOrg: "",
    year: "",
    credentialId: ""
  });

  // New Experience Form
  const [newExperience, setNewExperience] = useState({
    companyName: "",
    jobTitle: "",
    duration: "",
    responsibilities: "",
    technologiesUsed: ""
  });

  // New Education Form
  const [newEducation, setNewEducation] = useState({
    degree: "",
    specialization: "",
    college: "",
    graduationYear: "",
    cgpa: ""
  });

  // Temporary states for adding skills
  const [newTechSkill, setNewTechSkill] = useState("");
  const [newSoftSkill, setNewSoftSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  // Stats Data - Real-time (onboardingCount starts at 0)
  const [stats, setStats] = useState({
    profileScore: 0,
    interviewsCompleted: 0,
    skillsMastered: 0,
    onboardingCount: 0
  });

  const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

  // Sample jobs as fallback
  const sampleJobs = [
    { _id: 1, title: "Senior Full Stack Developer", company: "Tech Corp India", location: "Bangalore, India", salary: "₹15-25 LPA", description: "Looking for an experienced Full Stack Developer with strong React and Node.js skills.", type: "Full-time", experience: "3-5 years", requirements: ["React", "Node.js", "MongoDB", "JavaScript"], postedBy: "HR", postedDate: new Date().toISOString(), applicants: 12 },
    { _id: 2, title: "Frontend Developer - React", company: "Digital Innovations", location: "Remote", salary: "₹10-16 LPA", description: "Seeking a React developer to build modern web applications.", type: "Full-time", experience: "2-4 years", requirements: ["React", "JavaScript", "HTML/CSS", "Redux"], postedBy: "HR", postedDate: new Date().toISOString(), applicants: 8 },
    { _id: 3, title: "Backend Engineer - Node.js", company: "Cloud Systems", location: "Hyderabad, India", salary: "₹14-22 LPA", description: "Backend developer with Node.js expertise.", type: "Full-time", experience: "3-6 years", requirements: ["Node.js", "Python", "SQL", "MongoDB"], postedBy: "HR", postedDate: new Date().toISOString(), applicants: 5 }
  ];

  // Navigation Menu Items
  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, path: "/candidate" },
    { id: "skill-gap", name: "AI Skill Gap Analyzer", icon: <Target className="h-5 w-5" />, path: "/candidate/skill-gap" },
    { id: "ai-interview", name: "AI Mock Interview", icon: <Brain className="h-5 w-5" />, path: "/candidate/ai_interview" },
    { id: "resume-builder", name: "ATS Resume Builder", icon: <FileText className="h-5 w-5" />, path: "/candidate/resume-builder" },
    { id: "job-finder", name: "Discover Jobs", icon: <Briefcase className="h-5 w-5" />, path: "/candidate/jobs" },
    { id: "skill-tracker", name: "Skill Tracker Pro", icon: <TrendingUp className="h-5 w-5" />, path: "/candidate/skill-tracker" },
    { id: "interview-analytics", name: "Interview Analytics", icon: <BarChart3 className="h-5 w-5" />, path: "/candidate/interview-analytics" },
    { id: "my-interviews", name: "My Interviews", icon: <Video className="h-5 w-5" />, path: "/candidate/interviews" },
    { id: "onboarding", name: "Onboarding", icon: <Calendar className="h-5 w-5" />, path: "/candidate/onboarding" }
  ];

  // Features for the dashboard
  const features = [
    {
      id: 1, title: "AI Skill Gap Analyzer",
      description: "Paste any job description and instantly see what skills you're missing",
      features: ["Real-time skill matching", "Color-coded gap report", "Personalized learning path"],
      icon: <Target className="h-8 w-8" />, color: "from-blue-500 to-blue-600",
      buttonText: "Analyze Skills", onClick: () => navigate("/candidate/skill-gap")
    },
    {
      id: 2, title: "AI Mock Interview",
      description: "Practice with advanced AI interviewer and get real-time feedback",
      features: ["Real-time voice interaction", "Camera & microphone support", "Detailed analytics"],
      icon: <Brain className="h-8 w-8" />, color: "from-blue-500 to-blue-600",
      buttonText: "Start Interview", onClick: () => navigate("/candidate/ai_interview")
    },
    {
      id: 3, title: "ATS Resume Builder and Analyzer",
      description: "Create ATS-friendly resumes that get past automated screening",
      features: ["AI-powered suggestions", "Keyword optimization", "Multiple templates"],
      icon: <FileText className="h-8 w-8" />, color: "from-blue-500 to-blue-600",
      buttonText: "Build Resume", onClick: () => navigate("/candidate/resume-builder")
    },
    {
      id: 4, title: "Discover Jobs",
      description: "Explore job openings posted by HR. Apply with one click.",
      features: ["HR-posted jobs", "AI-powered matching", "Easy application"],
      icon: <Briefcase className="h-8 w-8" />, color: "from-blue-500 to-blue-600",
      buttonText: "Find Jobs", onClick: () => handleFindJobs()
    },
    {
      id: 5, title: "Skill Tracker Pro",
      description: "Track your skill development and measure progress over time",
      features: ["Skill proficiency heatmap", "Learning roadmap", "Industry benchmarks"],
      icon: <TrendingUp className="h-8 w-8" />, color: "from-blue-500 to-blue-600",
      buttonText: "Track Skills", onClick: () => navigate("/candidate/skill-tracker")
    },
    {
      id: 6, title: "Interview Analytics",
      description: "Deep dive into interview performance with AI insights",
      features: ["Score trends", "Weak topic identification", "Answer comparison"],
      icon: <BarChart3 className="h-8 w-8" />, color: "from-blue-500 to-blue-600",
      buttonText: "View Analytics", onClick: () => navigate("/candidate/interview-analytics")
    },
    {
      id: 7, title: "My Interviews",
      description: "View your scheduled interviews and join live rooms",
      features: ["Upcoming interviews", "Join with one click", "Interview history"],
      icon: <Video className="h-8 w-8" />, color: "from-blue-500 to-blue-600",
      buttonText: "View Interviews", onClick: () => navigate("/candidate/interviews")
    },
    {
      id: 8, title: "Onboarding",
      description: "Complete your profile and get started with the platform",
      features: ["Profile completion", "Skill assessment", "Career goals"],
      icon: <Calendar className="h-8 w-8" />, color: "from-blue-500 to-blue-600",
      buttonText: "Continue", onClick: () => navigate("/candidate/onboarding")
    }
  ];

  useEffect(() => {
    loadUserData();
    fetchOnboardingCount(); // Fetch real-time onboarding count
  }, []);

  // Calculate profile score locally based on actual data
  const calculateLocalProfileScore = (userData) => {
    let totalFields = 0;
    let filledFields = 0;
    
    // Basic Info (6 fields)
    const basicFields = ['name', 'email', 'phone', 'location', 'userTitle', 'professionalSummary'];
    basicFields.forEach(field => {
      totalFields++;
      if (userData[field] && userData[field].toString().trim() !== '') filledFields++;
    });
    
    // Social Links (3 fields)
    const socialFields = ['linkedin', 'github', 'portfolio'];
    socialFields.forEach(field => {
      totalFields++;
      if (userData[field] && userData[field].toString().trim() !== '') filledFields++;
    });
    
    // Skills
    totalFields++;
    if (userData.technicalSkills && userData.technicalSkills.length > 0) filledFields++;
    
    totalFields++;
    if (userData.softSkills && userData.softSkills.length > 0) filledFields++;
    
    // Education
    totalFields++;
    if (userData.education && userData.education.degree && userData.education.degree !== '') filledFields++;
    
    // Work Experience
    totalFields++;
    if (userData.workExperience && userData.workExperience.length > 0) filledFields++;
    
    // Projects
    totalFields++;
    if (userData.projects && userData.projects.length > 0) filledFields++;
    
    // Certifications
    totalFields++;
    if (userData.certifications && userData.certifications.length > 0) filledFields++;
    
    // Languages
    totalFields++;
    if (userData.languages && userData.languages.length > 0) filledFields++;
    
    // Avatar
    totalFields++;
    if (userData.avatar && userData.avatar !== '') filledFields++;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  // Fetch real-time onboarding count from backend
  const fetchOnboardingCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/profile/onboarding-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({ ...prev, onboardingCount: data.count || 0 }));
      }
    } catch (error) {
      console.error("Error fetching onboarding count:", error);
      // Keep onboardingCount as 0 if fetch fails
    }
  };

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      
      const res = await fetch(`${BASE_URL}/api/profile/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const me = await res.json();
      
      const calculatedScore = calculateLocalProfileScore(me);
      
      // Fix avatar URL
      let avatarUrl = "";
      if (me.avatar) {
        if (me.avatar.startsWith('http')) {
          avatarUrl = me.avatar;
        } else if (me.avatar.startsWith('/uploads')) {
          avatarUrl = `${BASE_URL}${me.avatar}`;
        } else {
          avatarUrl = `${BASE_URL}/uploads/${me.avatar}`;
        }
      }
      
      setProfile({
        _id: me._id,
        name: me.name || "",
        email: me.email || "",
        phone: me.phone || "",
        location: me.location || "",
        title: me.userTitle || "Student",
        bio: me.professionalSummary || "",
        linkedin: me.linkedin || "",
        github: me.github || "",
        portfolio: me.portfolio || "",
        resumeUrl: me.resumeUrl || "",
        avatar: avatarUrl,
        technicalSkills: me.technicalSkills || [],
        softSkills: me.softSkills || [],
        education: me.education ? [me.education] : [],
        languages: me.languages || [],
        projects: me.projects || [],
        certifications: me.certifications || [],
        workExperience: me.workExperience || []
      });
      
      setStats(prev => ({
        ...prev,
        profileScore: calculatedScore,
        interviewsCompleted: me.interviewHistory?.length || 0,
        skillsMastered: (me.technicalSkills?.length || 0) + (me.softSkills?.length || 0)
      }));
      
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFindJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data.length > 0 ? data : sampleJobs);
        setShowJobs(true);
      } else {
        setJobs(sampleJobs);
        setShowJobs(true);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs(sampleJobs);
      setShowJobs(true);
    }
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    // Pre-fill application data with profile info (editable)
    setApplicationData({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      coverLetter: "",
      resume: null
    });
    setShowApplyModal(true);
  };

  const handleApply = async () => {
    const { name, email, phone, coverLetter, resume } = applicationData;
    if (!name || !email || !phone) {
      alert("Please fill in your name, email, and phone number");
      return;
    }
    if (!resume) {
      alert("Please upload your resume (PDF or DOCX)");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("jobId", selectedJob._id);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("coverLetter", coverLetter || "");
      formData.append("resume", resume);

      const response = await fetch(`${BASE_URL}/api/jobs/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert(`✅ Application submitted successfully for ${selectedJob.title} at ${selectedJob.company}!`);
        setShowApplyModal(false);
        setSelectedJob(null);
        // Reset application data
        setApplicationData({ name: "", email: "", phone: "", coverLetter: "", resume: null });
      } else {
        const error = await response.json();
        alert(error.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Application error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleProfileClick = () => {
    setEditForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      title: profile.title,
      bio: profile.bio,
      linkedin: profile.linkedin,
      github: profile.github,
      portfolio: profile.portfolio,
      education: [...(profile.education || [])],
      technicalSkills: [...profile.technicalSkills],
      softSkills: [...profile.softSkills],
      languages: [...profile.languages],
      projects: [...(profile.projects || [])],
      certifications: [...(profile.certifications || [])],
      workExperience: [...(profile.workExperience || [])],
      avatarPreview: profile.avatar,
      avatarFile: null
    });
    setShowProfileModal(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, avatarPreview: reader.result, avatarFile: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      
      let avatarUrl = profile.avatar;
      if (editForm.avatarFile) {
        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append("avatar", editForm.avatarFile);
        const uploadRes = await fetch(`${BASE_URL}/api/profile/upload-avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          avatarUrl = data.avatarUrl || `${BASE_URL}${data.relativePath}`;
        }
        setUploadingAvatar(false);
      }
      
      const educationObj = editForm.education && editForm.education.length > 0 ? editForm.education[0] : {};
      
      const updateRes = await fetch(`${BASE_URL}/api/profile/update-full-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          location: editForm.location,
          userTitle: editForm.title,
          professionalSummary: editForm.bio,
          linkedin: editForm.linkedin,
          github: editForm.github,
          portfolio: editForm.portfolio,
          avatar: avatarUrl ? avatarUrl.replace(BASE_URL, '') : null,
          education: educationObj,
          technicalSkills: editForm.technicalSkills,
          softSkills: editForm.softSkills,
          languages: editForm.languages,
          workExperience: editForm.workExperience,
          projects: editForm.projects,
          certifications: editForm.certifications
        })
      });
      
      if (updateRes.ok) {
        alert("Profile updated successfully!");
        setShowProfileModal(false);
        await loadUserData();
      } else {
        const errorData = await updateRes.json();
        alert(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Something went wrong");
    } finally {
      setUpdating(false);
      setUploadingAvatar(false);
    }
  };

  const handleAddProject = async () => {
    if (!newProject.name) {
      alert("Please enter project name");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      await fetch(`${BASE_URL}/api/profile/add-project`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newProject.name,
          description: newProject.description,
          technologiesUsed: newProject.technologiesUsed.split(',').map(t => t.trim()),
          role: newProject.role,
          githubLink: newProject.githubLink
        })
      });
      alert("Project added successfully!");
      setShowAddProjectModal(false);
      loadUserData();
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Something went wrong");
    }
    setNewProject({ name: "", description: "", technologiesUsed: "", githubLink: "", role: "" });
  };

  const handleAddCertificate = async () => {
    if (!newCert.name) {
      alert("Please enter certificate name");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      await fetch(`${BASE_URL}/api/profile/add-certification`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newCert.name,
          issuingOrg: newCert.issuingOrg,
          year: newCert.year,
          credentialId: newCert.credentialId
        })
      });
      alert("Certificate added successfully!");
      setShowAddCertModal(false);
      loadUserData();
    } catch (error) {
      console.error("Error adding certificate:", error);
      alert("Something went wrong");
    }
    setNewCert({ name: "", issuingOrg: "", year: "", credentialId: "" });
  };

  const handleAddExperience = async () => {
    if (!newExperience.companyName || !newExperience.jobTitle) {
      alert("Please enter company name and job title");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      await fetch(`${BASE_URL}/api/profile/add-work-experience`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          companyName: newExperience.companyName,
          jobTitle: newExperience.jobTitle,
          duration: newExperience.duration,
          responsibilities: newExperience.responsibilities,
          technologiesUsed: newExperience.technologiesUsed.split(',').map(t => t.trim())
        })
      });
      alert("Experience added successfully!");
      setShowAddExperienceModal(false);
      loadUserData();
    } catch (error) {
      console.error("Error adding experience:", error);
      alert("Something went wrong");
    }
    setNewExperience({ companyName: "", jobTitle: "", duration: "", responsibilities: "", technologiesUsed: "" });
  };

  const handleAddEducation = () => {
    if (!newEducation.degree || !newEducation.college) {
      alert("Please enter degree and college");
      return;
    }
    setEditForm({ ...editForm, education: [...editForm.education, { id: Date.now().toString(), ...newEducation }] });
    setNewEducation({ degree: "", specialization: "", college: "", graduationYear: "", cgpa: "" });
  };

  const handleDeleteEducation = (eduId) => {
    setEditForm({ ...editForm, education: editForm.education.filter(e => e.id !== eduId) });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 fixed h-full z-20 overflow-y-auto`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0">
              <Zap className="h-6 w-6 text-white" />
            </div>
            {sidebarOpen && <span className="text-lg font-bold text-gray-900 whitespace-nowrap">HRMS</span>}
          </div>

          {/* User Profile */}
          <div onClick={handleProfileClick} className="flex items-center gap-3 mb-8 p-3 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition group">
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
                {profile.avatar && profile.avatar !== "" ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span class="text-white text-sm font-bold">${profile.name?.charAt(0)?.toUpperCase() || 'U'}</span>`; }} />
                ) : (
                  <span className="text-white text-sm font-bold">{profile.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                <Camera className="h-3 w-3 text-blue-500" />
              </div>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{profile.name || "Update Profile"}</p>
                <p className="text-xs text-gray-500 truncate">{profile.title || "Student"}</p>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.path && item.path !== "#") navigate(item.path);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id ? "bg-blue-600 text-white shadow-md" : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                <span className={`flex-shrink-0 ${activeTab === item.id ? "text-white" : "text-gray-500"}`}>
                  {item.icon}
                </span>
                {sidebarOpen && <span className="text-sm font-medium truncate">{item.name}</span>}
              </button>
            ))}
          </nav>

          {/* Bottom Menu */}
          <div className="mt-8 pt-4 border-t border-gray-200 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 transition">
              <HelpCircle className="h-5 w-5 text-gray-500 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Help & Support</span>}
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 transition">
              <LogOut className="h-5 w-5 text-gray-500 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-72' : 'ml-20'} flex-1 transition-all duration-300`}>
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition">
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition">
                <Search className="h-5 w-5 text-gray-500" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition relative">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center overflow-hidden">
                  {profile.avatar && profile.avatar !== "" ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span class="text-white text-sm font-bold">${profile.name?.charAt(0)?.toUpperCase() || 'U'}</span>`; }} />
                  ) : (
                    <span className="text-white text-sm font-bold">{profile.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                {sidebarOpen && (
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-gray-900">{profile.name || "Guest"}</p>
                    <p className="text-xs text-gray-500">{profile.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section - 4 Equal Stats Cards */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="px-8 py-12">
            <div className="flex justify-between items-start">
              <div>
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="bg-white/20 backdrop-blur px-4 py-1.5 rounded-full">
                    <span className="text-sm font-bold tracking-wide">CANDIDATE DASHBOARD</span>
                  </div>
                </div>
                <h1 className="text-4xl font-bold mb-2">Welcome back, {profile.name?.split(' ')[0] || 'Guest'}! 👋</h1>
                <p className="text-blue-100">Ready to advance your career today?</p>
              </div>
            </div>
            
            {/* 4 Equal Stats Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {/* Profile Score Card */}
              <div className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <BarChartIcon className="h-8 w-8 text-blue-200" />
                  <span className="text-xs text-blue-200 bg-white/20 px-2 py-1 rounded-full">Real-time</span>
                </div>
                <p className="text-3xl font-bold mt-2">{stats.profileScore}%</p>
                <p className="text-sm text-blue-100 mt-1">Profile Score</p>
                <div className="w-full bg-white/20 rounded-full h-1.5 mt-3">
                  <div className="bg-green-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${stats.profileScore}%` }}></div>
                </div>
              </div>

              {/* Interviews Card */}
              <div className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <Video className="h-8 w-8 text-blue-200" />
                  <span className="text-xs text-blue-200 bg-white/20 px-2 py-1 rounded-full">History</span>
                </div>
                <p className="text-3xl font-bold mt-2">{stats.interviewsCompleted}</p>
                <p className="text-sm text-blue-100 mt-1">Interviews Completed</p>
                <div className="mt-3 text-xs text-blue-200">
                  {stats.interviewsCompleted === 0 ? "Start your first interview" : "Keep improving!"}
                </div>
              </div>

              {/* Skills Card */}
              <div className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <Code className="h-8 w-8 text-blue-200" />
                  <span className="text-xs text-blue-200 bg-white/20 px-2 py-1 rounded-full">Mastered</span>
                </div>
                <p className="text-3xl font-bold mt-2">{stats.skillsMastered}</p>
                <p className="text-sm text-blue-100 mt-1">Skills Mastered</p>
                <div className="mt-3 text-xs text-blue-200">
                  {stats.skillsMastered === 0 ? "Add skills to your profile" : "Great progress!"}
                </div>
              </div>

              {/* Onboarding Card - Shows real-time count of students undergoing formalities */}
              <div className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-8 w-8 text-blue-200" />
                  <span className="text-xs text-blue-200 bg-white/20 px-2 py-1 rounded-full">Real-time</span>
                </div>
                <p className="text-3xl font-bold mt-2">{stats.onboardingCount}</p>
                <p className="text-sm text-blue-100 mt-1">Onboarding Students</p>
                <div className="mt-3 text-xs text-blue-200">
                  Currently undergoing formalities
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">Career Progress Tracker</h2>
            </div>
            <span className="text-xs text-gray-500">8 Powerful Tools</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.id} onClick={feature.onClick} className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden group cursor-pointer">
                <div className="p-6">
                  <div className={`bg-gradient-to-r ${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-md group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">{feature.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-1.5 mb-5">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full bg-gradient-to-r ${feature.color} text-white py-2 rounded-lg font-medium hover:opacity-90 transition flex items-center justify-center gap-2 text-sm`}>
                    {feature.buttonText}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jobs Section */}
        {showJobs && (
          <div className="px-8 pb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Available Jobs
              </h2>
              <span className="text-xs text-gray-500">{jobs.length} positions open</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job._id} className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Active</span>
                    </div>
                    <p className="text-sm text-gray-600">{job.company}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <MapPin className="h-3 w-3" />
                      <span>{job.location}</span>
                      <span className="text-gray-300">|</span>
                      <DollarSign className="h-3 w-3" />
                      <span>{job.salary || "Best in industry"}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {job.requirements?.slice(0, 3).map((req, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{req}</span>
                      ))}
                    </div>
                    <button onClick={() => handleJobClick(job)} className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">Need help? Our support team is here to help you succeed</p>
          <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">Contact Support →</button>
        </div>
      </div>

      {/* Profile Modal - Keep as is */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Complete Profile</h2>
                <p className="text-gray-500 text-sm">Showcase your skills, projects, and achievements</p>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Profile Tabs */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-2 overflow-x-auto">
                {[
                  { id: "basic", label: "Basic Info", icon: <User className="h-4 w-4" /> },
                  { id: "education", label: "Education", icon: <GraduationCap className="h-4 w-4" /> },
                  { id: "skills", label: "Skills", icon: <Code className="h-4 w-4" /> },
                  { id: "experience", label: "Experience", icon: <BriefcaseIcon className="h-4 w-4" /> },
                  { id: "projects", label: "Projects", icon: <FolderGit2 className="h-4 w-4" /> },
                  { id: "certificates", label: "Certificates", icon: <Award className="h-4 w-4" /> },
                  { id: "social", label: "Social Links", icon: <Linkedin className="h-4 w-4" /> }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveProfileTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${activeProfileTab === tab.id ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-6">
              {/* Basic Info Tab */}
              {activeProfileTab === "basic" && (
                <div>
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg overflow-hidden">
                        {editForm.avatarPreview ? (
                          <img src={editForm.avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : profile.avatar && profile.avatar !== "" ? (
                          <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl text-white font-bold">{editForm.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition shadow-lg">
                        <Camera className="h-4 w-4 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Location</label><input type="text" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2" /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label><input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2" /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary / Bio</label><textarea rows="3" value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2" placeholder="Tell us about yourself..." /></div>
                  </div>
                </div>
              )}
              
              {/* Education Tab */}
              {activeProfileTab === "education" && (
                <div>
                  <div className="mb-4"><h3 className="text-lg font-semibold mb-3">Add Education</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                    <input type="text" placeholder="Degree" value={newEducation.degree} onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})} className="border rounded-lg p-2" />
                    <input type="text" placeholder="Specialization" value={newEducation.specialization} onChange={(e) => setNewEducation({...newEducation, specialization: e.target.value})} className="border rounded-lg p-2" />
                    <input type="text" placeholder="College/University" value={newEducation.college} onChange={(e) => setNewEducation({...newEducation, college: e.target.value})} className="border rounded-lg p-2" />
                    <input type="text" placeholder="Graduation Year" value={newEducation.graduationYear} onChange={(e) => setNewEducation({...newEducation, graduationYear: e.target.value})} className="border rounded-lg p-2" />
                    <input type="text" placeholder="CGPA/Percentage" value={newEducation.cgpa} onChange={(e) => setNewEducation({...newEducation, cgpa: e.target.value})} className="border rounded-lg p-2" />
                    <button onClick={handleAddEducation} className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Add</button>
                  </div></div>
                  <div className="space-y-3">{editForm.education.map((edu, idx) => (<div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"><div><p className="font-semibold">{edu.degree}</p><p className="text-sm text-gray-600">{edu.college} • {edu.graduationYear}</p></div><button onClick={() => handleDeleteEducation(edu.id)} className="text-red-500"><Trash2 className="h-5 w-5" /></button></div>))}</div>
                </div>
              )}
              
              {/* Skills Tab */}
              {activeProfileTab === "skills" && (
                <div className="space-y-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills</label><div className="flex flex-wrap gap-2 mb-2">{editForm.technicalSkills.map((skill, idx) => (<span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">{skill}<button onClick={() => setEditForm({...editForm, technicalSkills: editForm.technicalSkills.filter(s => s !== skill)})}>×</button></span>))}</div><div className="flex gap-2"><input type="text" value={newTechSkill} onChange={(e) => setNewTechSkill(e.target.value)} placeholder="Add technical skill" className="flex-1 border rounded-lg p-2" /><button onClick={() => { if (newTechSkill.trim()) setEditForm({...editForm, technicalSkills: [...editForm.technicalSkills, newTechSkill.trim()]}); setNewTechSkill(""); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Add</button></div></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Soft Skills</label><div className="flex flex-wrap gap-2 mb-2">{editForm.softSkills.map((skill, idx) => (<span key={idx} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">{skill}<button onClick={() => setEditForm({...editForm, softSkills: editForm.softSkills.filter(s => s !== skill)})}>×</button></span>))}</div><div className="flex gap-2"><input type="text" value={newSoftSkill} onChange={(e) => setNewSoftSkill(e.target.value)} placeholder="Add soft skill" className="flex-1 border rounded-lg p-2" /><button onClick={() => { if (newSoftSkill.trim()) setEditForm({...editForm, softSkills: [...editForm.softSkills, newSoftSkill.trim()]}); setNewSoftSkill(""); }} className="bg-green-600 text-white px-4 py-2 rounded-lg">Add</button></div></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Languages</label><div className="flex flex-wrap gap-2 mb-2">{editForm.languages.map((lang, idx) => (<span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">{lang}<button onClick={() => setEditForm({...editForm, languages: editForm.languages.filter(l => l !== lang)})}>×</button></span>))}</div><div className="flex gap-2"><input type="text" value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} placeholder="Add language" className="flex-1 border rounded-lg p-2" /><button onClick={() => { if (newLanguage.trim()) setEditForm({...editForm, languages: [...editForm.languages, newLanguage.trim()]}); setNewLanguage(""); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg">Add</button></div></div>
                </div>
              )}
              
              {/* Experience Tab */}
              {activeProfileTab === "experience" && (
                <div><button onClick={() => setShowAddExperienceModal(true)} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus className="h-4 w-4" /> Add Experience</button>
                <div className="space-y-3">{editForm.workExperience.map((exp, idx) => (<div key={idx} className="border rounded-lg p-4"><h4 className="font-semibold">{exp.jobTitle} at {exp.companyName}</h4><p className="text-sm text-gray-600">{exp.duration}</p><p className="text-sm text-gray-600 mt-1">{exp.responsibilities}</p></div>))}</div></div>
              )}
              
              {/* Projects Tab */}
              {activeProfileTab === "projects" && (
                <div><button onClick={() => setShowAddProjectModal(true)} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus className="h-4 w-4" /> Add Project</button>
                <div className="space-y-4">{editForm.projects.map((project, idx) => (<div key={idx} className="border rounded-lg p-4"><h4 className="font-semibold">{project.name}</h4><p className="text-sm text-gray-600">{project.description}</p><div className="flex flex-wrap gap-1 mt-2">{project.technologiesUsed?.map((tech, i) => (<span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{tech}</span>))}</div></div>))}</div></div>
              )}
              
              {/* Certificates Tab */}
              {activeProfileTab === "certificates" && (
                <div><button onClick={() => setShowAddCertModal(true)} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus className="h-4 w-4" /> Add Certificate</button>
                <div className="space-y-3">{editForm.certifications.map((cert, idx) => (<div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"><div><p className="font-semibold">{cert.name}</p><p className="text-sm text-gray-600">{cert.issuingOrg}</p></div></div>))}</div></div>
              )}
              
              {/* Social Links Tab */}
              {activeProfileTab === "social" && (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1"><Linkedin className="h-4 w-4 inline mr-2 text-blue-600" /> LinkedIn</label><input type="url" value={editForm.linkedin} onChange={(e) => setEditForm({...editForm, linkedin: e.target.value})} placeholder="https://linkedin.com/in/username" className="w-full border border-gray-300 rounded-lg p-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1"><Github className="h-4 w-4 inline mr-2" /> GitHub</label><input type="url" value={editForm.github} onChange={(e) => setEditForm({...editForm, github: e.target.value})} placeholder="https://github.com/username" className="w-full border border-gray-300 rounded-lg p-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1"><Globe className="h-4 w-4 inline mr-2 text-green-600" /> Portfolio</label><input type="url" value={editForm.portfolio} onChange={(e) => setEditForm({...editForm, portfolio: e.target.value})} placeholder="https://yourportfolio.com" className="w-full border border-gray-300 rounded-lg p-2" /></div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button onClick={handleUpdateProfile} disabled={updating || uploadingAvatar} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">{updating || uploadingAvatar ? "Saving..." : "Save All Changes"}</button>
              <button onClick={() => setShowProfileModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProjectModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-md w-full"><div className="p-6 border-b flex justify-between"><h3 className="text-xl font-bold">Add Project</h3><button onClick={() => setShowAddProjectModal(false)}><X className="h-5 w-5" /></button></div><div className="p-6 space-y-3"><input type="text" placeholder="Project Name" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} className="w-full border rounded-lg p-2" /><textarea placeholder="Description" rows="3" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} className="w-full border rounded-lg p-2" /><input type="text" placeholder="Technologies (comma separated)" value={newProject.technologiesUsed} onChange={(e) => setNewProject({...newProject, technologiesUsed: e.target.value})} className="w-full border rounded-lg p-2" /><input type="text" placeholder="Your Role" value={newProject.role} onChange={(e) => setNewProject({...newProject, role: e.target.value})} className="w-full border rounded-lg p-2" /><input type="url" placeholder="GitHub Link" value={newProject.githubLink} onChange={(e) => setNewProject({...newProject, githubLink: e.target.value})} className="w-full border rounded-lg p-2" /></div><div className="p-6 border-t flex gap-3"><button onClick={handleAddProject} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Add</button><button onClick={() => setShowAddProjectModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button></div></div></div>)}

      {/* Add Certificate Modal */}
      {showAddCertModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-md w-full"><div className="p-6 border-b flex justify-between"><h3 className="text-xl font-bold">Add Certificate</h3><button onClick={() => setShowAddCertModal(false)}><X className="h-5 w-5" /></button></div><div className="p-6 space-y-3"><input type="text" placeholder="Certificate Name" value={newCert.name} onChange={(e) => setNewCert({...newCert, name: e.target.value})} className="w-full border rounded-lg p-2" /><input type="text" placeholder="Issuing Organization" value={newCert.issuingOrg} onChange={(e) => setNewCert({...newCert, issuingOrg: e.target.value})} className="w-full border rounded-lg p-2" /><input type="text" placeholder="Year" value={newCert.year} onChange={(e) => setNewCert({...newCert, year: e.target.value})} className="w-full border rounded-lg p-2" /></div><div className="p-6 border-t flex gap-3"><button onClick={handleAddCertificate} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Add</button><button onClick={() => setShowAddCertModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button></div></div></div>)}

      {/* Add Experience Modal */}
      {showAddExperienceModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-md w-full"><div className="p-6 border-b flex justify-between"><h3 className="text-xl font-bold">Add Experience</h3><button onClick={() => setShowAddExperienceModal(false)}><X className="h-5 w-5" /></button></div><div className="p-6 space-y-3"><input type="text" placeholder="Company Name" value={newExperience.companyName} onChange={(e) => setNewExperience({...newExperience, companyName: e.target.value})} className="w-full border rounded-lg p-2" /><input type="text" placeholder="Job Title" value={newExperience.jobTitle} onChange={(e) => setNewExperience({...newExperience, jobTitle: e.target.value})} className="w-full border rounded-lg p-2" /><input type="text" placeholder="Duration" value={newExperience.duration} onChange={(e) => setNewExperience({...newExperience, duration: e.target.value})} className="w-full border rounded-lg p-2" /><textarea placeholder="Responsibilities" rows="3" value={newExperience.responsibilities} onChange={(e) => setNewExperience({...newExperience, responsibilities: e.target.value})} className="w-full border rounded-lg p-2" /><input type="text" placeholder="Technologies Used" value={newExperience.technologiesUsed} onChange={(e) => setNewExperience({...newExperience, technologiesUsed: e.target.value})} className="w-full border rounded-lg p-2" /></div><div className="p-6 border-t flex gap-3"><button onClick={handleAddExperience} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Add</button><button onClick={() => setShowAddExperienceModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button></div></div></div>)}

      {/* ENHANCED APPLY MODAL with Resume Upload */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold">Apply for {selectedJob.title}</h2>
                <p className="text-gray-500 text-sm">{selectedJob.company} • {selectedJob.location}</p>
              </div>
              <button onClick={() => { setShowApplyModal(false); setSelectedJob(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <form className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={applicationData.name}
                    onChange={(e) => setApplicationData({ ...applicationData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={applicationData.email}
                    onChange={(e) => setApplicationData({ ...applicationData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={applicationData.phone}
                    onChange={(e) => setApplicationData({ ...applicationData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resume (PDF/DOCX) *</label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => setApplicationData({ ...applicationData, resume: e.target.files[0] })}
                    className="w-full border border-gray-300 rounded-lg p-2 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Accepted: PDF, DOCX (Max 5MB)</p>
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter (optional)</label>
                  <textarea
                    rows="3"
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                    placeholder="Why are you interested in this role?"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button onClick={handleApply} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                Submit Application
              </button>
              <button onClick={() => { setShowApplyModal(false); setSelectedJob(null); }} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
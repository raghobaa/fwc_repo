import React, { useState, useEffect } from "react";
import { 
  Building, MapPin, DollarSign, CheckCircle, XCircle, Search, Zap, 
  X, ChevronRight, Briefcase, TrendingUp, Linkedin, Filter, 
  Star, Award, Users, Globe, FilterX, Rocket
} from 'lucide-react';

export default function SmartJobFinder() {
  const [activeTab, setActiveTab] = useState("internal");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
    resume: null
  });
  const [filters, setFilters] = useState({
    jobType: "all",
    location: "all",
    minSalary: 0,
    maxSalary: 50
  });
  const [showFilters, setShowFilters] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [marketJobs, setMarketJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

  // Internal Jobs
  const internalJobs = [
    { 
      id: 1, title: "Senior Full Stack Developer", company: "Tech Corp India", companyType: "MNC",
      source: "Internal", location: "Bangalore", salary: "₹15-25 LPA", salaryMin: 15, salaryMax: 25,
      matchScore: 92, matchingSkills: ["React", "Node.js", "MongoDB"], missingSkills: ["Docker", "AWS"],
      recommendation: "Excellent Match!", postedDate: "2 days ago", logo: "🏢"
    },
    { 
      id: 2, title: "Frontend Developer", company: "Digital Innovations", companyType: "Startup",
      source: "Internal", location: "Remote", salary: "₹10-16 LPA", salaryMin: 10, salaryMax: 16,
      matchScore: 85, matchingSkills: ["React", "JavaScript"], missingSkills: ["TypeScript"],
      recommendation: "Great Match!", postedDate: "5 days ago", logo: "🚀"
    },
    { 
      id: 3, title: "Backend Engineer", company: "Cloud Systems", companyType: "MNC",
      source: "Internal", location: "Hyderabad", salary: "₹14-22 LPA", salaryMin: 14, salaryMax: 22,
      matchScore: 78, matchingSkills: ["Node.js", "Python"], missingSkills: ["Docker"],
      recommendation: "Good Match!", postedDate: "1 week ago", logo: "🏢"
    }
  ];

  // Expanded Startup & MNC Jobs with Multiple Locations
  const allMarketJobs = [
    // ========== BANGALORE STARTUPS ==========
    { id: 101, title: "Software Engineer", company: "Razorpay", companyType: "Startup", source: "LinkedIn", location: "Bangalore", salary: "₹8-14 LPA", salaryMin: 8, salaryMax: 14, matchScore: 85, matchingSkills: ["React", "Node.js"], missingSkills: ["Payment Gateway"], recommendation: "Great Match! Fintech expertise valuable.", postedDate: "2 days ago", logo: "🦅", jobUrl: "https://razorpay.com/careers", applicants: "156 applicants", rating: 4.5 },
    { id: 102, title: "Frontend Developer", company: "Swiggy", companyType: "Startup", source: "LinkedIn", location: "Bangalore", salary: "₹10-18 LPA", salaryMin: 10, salaryMax: 18, matchScore: 88, matchingSkills: ["React", "JavaScript", "CSS"], missingSkills: ["Next.js"], recommendation: "High Match!", postedDate: "3 days ago", logo: "🛵", jobUrl: "https://swiggy.com/careers", applicants: "234 applicants", rating: 4.4 },
    { id: 103, title: "Backend Engineer", company: "Ola", companyType: "Startup", source: "Indeed", location: "Bangalore", salary: "₹9-15 LPA", salaryMin: 9, salaryMax: 15, matchScore: 82, matchingSkills: ["Java", "Spring Boot"], missingSkills: ["Kafka"], recommendation: "Good Match!", postedDate: "5 days ago", logo: "🚕", jobUrl: "https://ola.com/careers", applicants: "189 applicants", rating: 4.3 },
    { id: 104, title: "DevOps Engineer", company: "Cred", companyType: "Startup", source: "LinkedIn", location: "Bangalore", salary: "₹12-20 LPA", salaryMin: 12, salaryMax: 20, matchScore: 76, matchingSkills: ["AWS", "Docker"], missingSkills: ["Kubernetes"], recommendation: "Medium Match", postedDate: "1 week ago", logo: "💳", jobUrl: "https://cred.com/careers", applicants: "98 applicants", rating: 4.6 },
    { id: 105, title: "Data Scientist", company: "Unacademy", companyType: "Startup", source: "LinkedIn", location: "Bangalore", salary: "₹8-12 LPA", salaryMin: 8, salaryMax: 12, matchScore: 70, matchingSkills: ["Python", "SQL"], missingSkills: ["Machine Learning"], recommendation: "Good foundation", postedDate: "4 days ago", logo: "📚", jobUrl: "https://unacademy.com/careers", applicants: "167 applicants", rating: 4.2 },
    { id: 106, title: "Product Manager", company: "Freshworks", companyType: "Startup", source: "Indeed", location: "Bangalore", salary: "₹14-22 LPA", salaryMin: 14, salaryMax: 22, matchScore: 65, matchingSkills: ["Agile", "Product"], missingSkills: ["Market Research"], recommendation: "Potential Match", postedDate: "6 days ago", logo: "🔄", jobUrl: "https://freshworks.com/careers", applicants: "89 applicants", rating: 4.5 },
    { id: 107, title: "SDE Intern", company: "Groww", companyType: "Startup", source: "LinkedIn", location: "Bangalore", salary: "₹5-8 LPA", salaryMin: 5, salaryMax: 8, matchScore: 92, matchingSkills: ["React", "JavaScript"], missingSkills: [], recommendation: "Excellent Entry Level!", postedDate: "1 day ago", logo: "🌱", jobUrl: "https://groww.in/careers", applicants: "456 applicants", rating: 4.4 },
    { id: 108, title: "Java Developer", company: "PhonePe", companyType: "Startup", source: "LinkedIn", location: "Bangalore", salary: "₹8-14 LPA", salaryMin: 8, salaryMax: 14, matchScore: 80, matchingSkills: ["Java", "Spring"], missingSkills: ["Hibernate"], recommendation: "Good Match", postedDate: "3 days ago", logo: "📱", jobUrl: "https://phonepe.com/careers", applicants: "234 applicants", rating: 4.5 },

    // ========== HYDERABAD STARTUPS ==========
    { id: 201, title: "Full Stack Developer", company: "Zomato", companyType: "Startup", source: "LinkedIn", location: "Hyderabad", salary: "₹9-16 LPA", salaryMin: 9, salaryMax: 16, matchScore: 86, matchingSkills: ["React", "Node.js"], missingSkills: ["Redis"], recommendation: "High Match!", postedDate: "2 days ago", logo: "🍕", jobUrl: "https://zomato.com/careers", applicants: "189 applicants", rating: 4.3 },
    { id: 202, title: "UI/UX Developer", company: "Byju's", companyType: "Startup", source: "Indeed", location: "Hyderabad", salary: "₹6-10 LPA", salaryMin: 6, salaryMax: 10, matchScore: 78, matchingSkills: ["React", "CSS"], missingSkills: ["Figma"], recommendation: "Good Match", postedDate: "4 days ago", logo: "📖", jobUrl: "https://byjus.com/careers", applicants: "134 applicants", rating: 4.1 },
    { id: 203, title: "Backend Developer", company: "Meesho", companyType: "Startup", source: "LinkedIn", location: "Hyderabad", salary: "₹10-18 LPA", salaryMin: 10, salaryMax: 18, matchScore: 84, matchingSkills: ["Python", "Django"], missingSkills: ["Celery"], recommendation: "Great Match!", postedDate: "5 days ago", logo: "🛍️", jobUrl: "https://meesho.com/careers", applicants: "145 applicants", rating: 4.4 },
    { id: 204, title: "DevOps Trainee", company: "BillDesk", companyType: "Startup", source: "LinkedIn", location: "Hyderabad", salary: "₹5-7 LPA", salaryMin: 5, salaryMax: 7, matchScore: 88, matchingSkills: ["Linux", "AWS"], missingSkills: ["Jenkins"], recommendation: "Excellent Entry Point", postedDate: "1 day ago", logo: "📊", jobUrl: "https://billdesk.com/careers", applicants: "267 applicants", rating: 4.2 },
    { id: 205, title: "Software Engineer", company: "ShareChat", companyType: "Startup", source: "Indeed", location: "Hyderabad", salary: "₹7-12 LPA", salaryMin: 7, salaryMax: 12, matchScore: 75, matchingSkills: ["Android", "Kotlin"], missingSkills: ["iOS"], recommendation: "Good Match", postedDate: "6 days ago", logo: "💬", jobUrl: "https://sharechat.com/careers", applicants: "178 applicants", rating: 4.3 },

    // ========== PUNE STARTUPS ==========
    { id: 301, title: "React Developer", company: "FirstCry", companyType: "Startup", source: "LinkedIn", location: "Pune", salary: "₹6-10 LPA", salaryMin: 6, salaryMax: 10, matchScore: 85, matchingSkills: ["React", "Redux"], missingSkills: ["Next.js"], recommendation: "Good Match", postedDate: "3 days ago", logo: "👶", jobUrl: "https://firstcry.com/careers", applicants: "123 applicants", rating: 4.2 },
    { id: 302, title: "Python Developer", company: "PubMatic", companyType: "Startup", source: "LinkedIn", location: "Pune", salary: "₹8-14 LPA", salaryMin: 8, salaryMax: 14, matchScore: 80, matchingSkills: ["Python", "Flask"], missingSkills: ["Django"], recommendation: "Good Match", postedDate: "4 days ago", logo: "📈", jobUrl: "https://pubmatic.com/careers", applicants: "98 applicants", rating: 4.3 },
    { id: 303, title: "SDE - Backend", company: "Paytm", companyType: "Startup", source: "Indeed", location: "Pune", salary: "₹9-15 LPA", salaryMin: 9, salaryMax: 15, matchScore: 82, matchingSkills: ["Java", "Spring"], missingSkills: ["Microservices"], recommendation: "Good Match", postedDate: "5 days ago", logo: "💸", jobUrl: "https://paytm.com/careers", applicants: "234 applicants", rating: 4.4 },
    { id: 304, title: "Frontend Intern", company: "Dream11", companyType: "Startup", source: "LinkedIn", location: "Pune", salary: "₹5-7 LPA", salaryMin: 5, salaryMax: 7, matchScore: 90, matchingSkills: ["JavaScript", "React"], missingSkills: [], recommendation: "Excellent Opportunity", postedDate: "2 days ago", logo: "🏏", jobUrl: "https://dream11.com/careers", applicants: "567 applicants", rating: 4.5 },

    // ========== CHENNAI STARTUPS ==========
    { id: 401, title: "Full Stack Engineer", company: "Zoho", companyType: "Startup", source: "LinkedIn", location: "Chennai", salary: "₹7-12 LPA", salaryMin: 7, salaryMax: 12, matchScore: 87, matchingSkills: ["JavaScript", "React", "Node.js"], missingSkills: ["AWS"], recommendation: "High Match!", postedDate: "3 days ago", logo: "📊", jobUrl: "https://zoho.com/careers", applicants: "178 applicants", rating: 4.5 },
    { id: 402, title: "Java Developer", company: "Chargebee", companyType: "Startup", source: "Indeed", location: "Chennai", salary: "₹8-14 LPA", salaryMin: 8, salaryMax: 14, matchScore: 78, matchingSkills: ["Java", "Spring"], missingSkills: ["Hibernate"], recommendation: "Good Match", postedDate: "4 days ago", logo: "🐝", jobUrl: "https://chargebee.com/careers", applicants: "112 applicants", rating: 4.3 },
    { id: 403, title: "DevOps Engineer", company: "Freshworks", companyType: "Startup", source: "LinkedIn", location: "Chennai", salary: "₹10-18 LPA", salaryMin: 10, salaryMax: 18, matchScore: 72, matchingSkills: ["Docker", "AWS"], missingSkills: ["Kubernetes"], recommendation: "Medium Match", postedDate: "5 days ago", logo: "🔄", jobUrl: "https://freshworks.com/careers", applicants: "89 applicants", rating: 4.6 },

    // ========== REMOTE STARTUPS ==========
    { id: 501, title: "Remote React Developer", company: "Atlassian", companyType: "Startup", source: "LinkedIn", location: "Remote", salary: "₹12-20 LPA", salaryMin: 12, salaryMax: 20, matchScore: 86, matchingSkills: ["React", "TypeScript"], missingSkills: ["GraphQL"], recommendation: "High Match!", postedDate: "2 days ago", logo: "🔷", jobUrl: "https://atlassian.com/careers", applicants: "345 applicants", rating: 4.7 },
    { id: 502, title: "Backend Engineer", company: "GitHub", companyType: "Startup", source: "LinkedIn", location: "Remote", salary: "₹15-25 LPA", salaryMin: 15, salaryMax: 25, matchScore: 84, matchingSkills: ["Ruby", "Python"], missingSkills: ["Go"], recommendation: "Good Match", postedDate: "3 days ago", logo: "🐙", jobUrl: "https://github.com/careers", applicants: "267 applicants", rating: 4.8 },
    { id: 503, title: "Junior Developer", company: "Stripe", companyType: "Startup", source: "Indeed", location: "Remote", salary: "₹8-14 LPA", salaryMin: 8, salaryMax: 14, matchScore: 82, matchingSkills: ["JavaScript", "API"], missingSkills: ["Payment Systems"], recommendation: "Good Match", postedDate: "4 days ago", logo: "💳", jobUrl: "https://stripe.com/careers", applicants: "234 applicants", rating: 4.6 },
    { id: 504, title: "Frontend Developer", company: "Canva", companyType: "Startup", source: "LinkedIn", location: "Remote", salary: "₹10-18 LPA", salaryMin: 10, salaryMax: 18, matchScore: 88, matchingSkills: ["React", "TypeScript"], missingSkills: ["WebGL"], recommendation: "High Match!", postedDate: "5 days ago", logo: "🎨", jobUrl: "https://canva.com/careers", applicants: "412 applicants", rating: 4.7 },
    { id: 505, title: "Support Engineer", company: "Slack", companyType: "Startup", source: "Indeed", location: "Remote", salary: "₹7-12 LPA", salaryMin: 7, salaryMax: 12, matchScore: 70, matchingSkills: ["Communication", "Troubleshooting"], missingSkills: ["API"], recommendation: "Entry Level", postedDate: "1 week ago", logo: "💬", jobUrl: "https://slack.com/careers", applicants: "189 applicants", rating: 4.4 },

    // ========== MNC JOBS (Higher Salary) ==========
    { id: 601, title: "Senior Software Engineer", company: "Google", companyType: "MNC", source: "LinkedIn", location: "Bangalore", salary: "₹25-40 LPA", salaryMin: 25, salaryMax: 40, matchScore: 78, matchingSkills: ["DSA", "System Design"], missingSkills: ["C++"], recommendation: "Good Target", postedDate: "2 days ago", logo: "🔵", jobUrl: "https://google.com/careers", applicants: "567 applicants", rating: 4.9 },
    { id: 602, title: "SDE II", company: "Amazon", companyType: "MNC", source: "LinkedIn", location: "Hyderabad", salary: "₹22-35 LPA", salaryMin: 22, salaryMax: 35, matchScore: 82, matchingSkills: ["Java", "AWS"], missingSkills: ["System Design"], recommendation: "Good Match", postedDate: "3 days ago", logo: "🟠", jobUrl: "https://amazon.com/careers", applicants: "445 applicants", rating: 4.8 },
    { id: 603, title: "Frontend Engineer", company: "Microsoft", companyType: "MNC", source: "LinkedIn", location: "Remote", salary: "₹20-32 LPA", salaryMin: 20, salaryMax: 32, matchScore: 86, matchingSkills: ["React", "TypeScript"], missingSkills: ["Azure"], recommendation: "High Match!", postedDate: "4 days ago", logo: "🟢", jobUrl: "https://microsoft.com/careers", applicants: "389 applicants", rating: 4.9 },
    { id: 604, title: "Software Engineer", company: "Meta", companyType: "MNC", source: "LinkedIn", location: "Remote", salary: "₹28-45 LPA", salaryMin: 28, salaryMax: 45, matchScore: 75, matchingSkills: ["React", "PHP"], missingSkills: ["GraphQL"], recommendation: "Medium Match", postedDate: "5 days ago", logo: "🔷", jobUrl: "https://meta.com/careers", applicants: "678 applicants", rating: 4.9 }
  ];

  useEffect(() => {
    loadUserProfile();
    setMarketJobs(allMarketJobs);
    setFilteredJobs(allMarketJobs);
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";
      const response = await fetch(`${BASE_URL}/api/profile/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const user = await response.json();
        setUserProfile(user);
        setApplicationData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          coverLetter: "",
          resume: null
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...marketJobs];
    
    if (filters.jobType !== "all") {
      filtered = filtered.filter(job => 
        filters.jobType === "startup" ? job.companyType === "Startup" : job.companyType === "MNC"
      );
    }
    
    if (filters.location !== "all") {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    filtered = filtered.filter(job => 
      job.salaryMin >= filters.minSalary && job.salaryMax <= filters.maxSalary
    );
    
    setFilteredJobs(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleDirectApply = () => {
    if (!applicationData.name || !applicationData.email) {
      alert("Please fill in your name and email");
      return;
    }
    
    if (selectedJob.source === "Internal") {
      alert(`✅ Application submitted successfully to ${selectedJob.company}!\n\nWe'll notify you about the next steps.`);
    } else {
      if (selectedJob.jobUrl) {
        window.open(selectedJob.jobUrl, "_blank");
        alert(`🔗 Redirecting you to ${selectedJob.source} to complete your application for ${selectedJob.title} at ${selectedJob.company}`);
      } else {
        alert(`✅ Interest registered for ${selectedJob.title} at ${selectedJob.company}!\n\nThe recruiter will reach out to you.`);
      }
    }
    
    setShowApplyModal(false);
    setSelectedJob(null);
  };

  const getMatchColor = (score) => {
    if (score >= 70) return "bg-green-100 text-green-700";
    if (score >= 50) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getCompanyTypeIcon = (type) => {
    return type === "MNC" ? <Globe className="h-4 w-4 text-blue-500" /> : <Rocket className="h-4 w-4 text-orange-500" />;
  };

  const JobCard = ({ job }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl hover:border-blue-400 transition-all duration-300 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{job.logo}</span>
              <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
              <Building className="h-4 w-4" />
              <span>{job.company}</span>
              <span className="text-gray-300">|</span>
              {getCompanyTypeIcon(job.companyType)}
              <span className={`text-xs ${job.companyType === "MNC" ? "text-blue-600" : "text-orange-600"}`}>
                {job.companyType}
              </span>
              <span className="text-gray-300">|</span>
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getMatchColor(job.matchScore)}`}>
            {job.matchScore}% Match
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <DollarSign className="h-4 w-4" />
            <span>{job.salary}</span>
            {job.rating && (
              <>
                <span className="text-gray-300">|</span>
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{job.rating} ★</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-xs text-gray-400">Source:</span>
            <span className="flex items-center gap-1">
              {job.source === "LinkedIn" ? <Linkedin className="h-3 w-3 text-blue-600" /> : 
               job.source === "Indeed" ? <Briefcase className="h-3 w-3 text-purple-600" /> :
               <Building className="h-3 w-3 text-green-600" />}
              {job.source}
            </span>
            {job.applicants && (
              <>
                <span className="text-gray-300">|</span>
                <Users className="h-3 w-3" />
                <span className="text-xs">{job.applicants}</span>
              </>
            )}
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-400">Posted: {job.postedDate}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {job.matchingSkills?.slice(0, 3).map((skill, i) => (
              <span key={i} className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {skill}
              </span>
            ))}
            {job.missingSkills?.slice(0, 2).map((skill, i) => (
              <span key={i} className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {skill}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500">{job.recommendation}</p>
        </div>
        
        <button
          onClick={() => handleApplyClick(job)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          {job.source === "Internal" ? "Apply Now (Direct)" : `Apply on ${job.source}`}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const currentJobs = activeTab === "internal" ? internalJobs : filteredJobs;

  // Get unique locations for filter
  const uniqueLocations = [...new Set(marketJobs.map(job => job.location))];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-4">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">AI POWERED JOB MATCHING</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Job Finder</h1>
          <p className="text-gray-500">Discover opportunities from LinkedIn, Indeed & Internal jobs</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 justify-center flex-wrap">
          <button
            onClick={() => setActiveTab("internal")}
            className={`px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2 ${
              activeTab === "internal" 
                ? "bg-blue-600 text-white shadow-lg" 
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Building className="h-5 w-5" />
            Internal Jobs ({internalJobs.length})
          </button>
          <button
            onClick={() => setActiveTab("market")}
            className={`px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2 ${
              activeTab === "market" 
                ? "bg-green-600 text-white shadow-lg" 
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            Market Jobs ({filteredJobs.length})
          </button>
        </div>

        {/* Filters for Market Jobs */}
        {activeTab === "market" && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Filter Jobs</h3>
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="text-blue-600 text-sm hover:underline"
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Type</label>
                  <select
                    value={filters.jobType}
                    onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Companies</option>
                    <option value="mnc">MNC (Google, Microsoft, Amazon)</option>
                    <option value="startup">Startups & Unicorns</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Locations</option>
                    {uniqueLocations.map(loc => (
                      <option key={loc} value={loc.toLowerCase()}>{loc}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary (LPA)</label>
                  <input
                    type="number"
                    placeholder="Min LPA"
                    value={filters.minSalary}
                    onChange={(e) => setFilters({...filters, minSalary: parseInt(e.target.value) || 0})}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary (LPA)</label>
                  <input
                    type="number"
                    placeholder="Max LPA"
                    value={filters.maxSalary}
                    onChange={(e) => setFilters({...filters, maxSalary: parseInt(e.target.value) || 50})}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Jobs Grid */}
        {currentJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Jobs Found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold">Apply for {selectedJob.title}</h2>
                <p className="text-gray-500 text-sm">{selectedJob.company} • {selectedJob.location}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedJob.source === "Internal" ? "Direct Application" : `Via ${selectedJob.source}`}
                </p>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className={`mb-4 p-3 rounded-lg border ${getMatchColor(selectedJob.matchScore)}`}>
                <div className="flex justify-between">
                  <span>Match Score</span>
                  <span className="font-bold">{selectedJob.matchScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className={`h-2 rounded-full ${selectedJob.matchScore >= 70 ? 'bg-green-500' : selectedJob.matchScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                       style={{ width: `${selectedJob.matchScore}%` }} />
                </div>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm"><strong>💰 Salary:</strong> {selectedJob.salary}</p>
                <p className="text-sm mt-1"><strong>🏢 Company Type:</strong> {selectedJob.companyType}</p>
                <p className="text-sm mt-1"><strong>📍 Location:</strong> {selectedJob.location}</p>
                {selectedJob.rating && <p className="text-sm mt-1"><strong>⭐ Rating:</strong> {selectedJob.rating} ★</p>}
              </div>
              
              {selectedJob.matchingSkills && selectedJob.matchingSkills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-green-600 mb-1">✓ Your Matching Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.matchingSkills.map((skill, i) => (
                      <span key={i} className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-3 mt-4">
                <h3 className="font-semibold text-gray-900">Your Information</h3>
                <input
                  type="text"
                  value={applicationData.name}
                  onChange={(e) => setApplicationData({...applicationData, name: e.target.value})}
                  placeholder="Full Name *"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  value={applicationData.email}
                  onChange={(e) => setApplicationData({...applicationData, email: e.target.value})}
                  placeholder="Email *"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  value={applicationData.phone}
                  onChange={(e) => setApplicationData({...applicationData, phone: e.target.value})}
                  placeholder="Phone Number"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  rows="3"
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
                  placeholder="Why are you interested in this role?"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {selectedJob.source !== "Internal" && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    🔗 You'll be redirected to {selectedJob.source} to complete your application
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button onClick={handleDirectApply} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                {selectedJob.source === "Internal" ? "Submit Application" : `Continue on ${selectedJob.source}`}
              </button>
              <button onClick={() => setShowApplyModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
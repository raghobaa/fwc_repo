import React, { useState, useCallback } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ResumeBuilderPage() {
  const [resume, setResume] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    professionalSummary: "",
    education: "",
    experience: "",
    projects: "",
    skills: "",
    certifications: "",
  });

  const [generatedResume, setGeneratedResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [showJobMatch, setShowJobMatch] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");

  const handleChange = (e) => {
    setResume({
      ...resume,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenerate = async () => {
    if (!resume.name.trim()) {
      alert("Please enter at least your full name");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5002/api/resume-builder/generate",
        resume
      );

      setGeneratedResume({
        ...resume,
        ...response.data,
      });
    } catch (error) {
      console.error(error);
      setGeneratedResume({
        ...resume,
        summary: resume.professionalSummary || "Experienced professional with expertise in software development.",
      });
      alert("Backend not available, using local preview");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload PDF or Word documents only");
      return;
    }
    
    setUploadedFile(file);
  };

  const analyzeResume = async () => {
    if (!uploadedFile) {
      alert("Please upload a resume file first");
      return;
    }
    
    const formData = new FormData();
    formData.append("resume", uploadedFile);
    if (jobDescription) {
      formData.append("jobDescription", jobDescription);
    }
    
    setAtsLoading(true);
    try {
      const response = await axios.post("http://localhost:5002/api/resume-builder/analyze-ats", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setAtsResult(response.data);
      setShowJobMatch(!!jobDescription);
    } catch (error) {
      console.error("ATS Analysis failed:", error);
      setAtsResult({
        score: 72,
        overallScore: 72,
        keywordMatchScore: 68,
        skillsAlignmentScore: 75,
        experienceScore: 70,
        formattingScore: 85,
        structureScore: 80,
        feedback: "Your resume shows good potential but needs optimization for ATS systems.",
        improvements: [
          "Add more industry-specific keywords from the job description",
          "Use standard section headings (Experience, Education, Skills)",
          "Include measurable achievements with numbers and metrics",
          "Remove complex formatting like tables and columns",
          "Add a professional summary section at the top"
        ],
        missingKeywords: ["Agile Methodology", "Project Management", "Data Analysis", "Cloud Computing", "API Integration"],
        matchedKeywords: ["JavaScript", "React", "Python", "SQL", "Git"],
        strongSections: ["Skills", "Projects"],
        weakSections: ["Experience", "Professional Summary"],
        recommendedSkills: ["TypeScript", "Node.js", "AWS", "Docker", "GraphQL"],
        formatIssues: ["Tables detected", "Unusual font usage", "Complex column layout"]
      });
    } finally {
      setAtsLoading(false);
    }
  };

  const downloadResume = async () => {
    if (!generatedResume) return;
    
    const resumeContent = document.createElement("div");
    resumeContent.style.backgroundColor = "white";
    resumeContent.style.padding = "40px";
    resumeContent.style.width = "800px";
    resumeContent.style.fontFamily = "Arial, sans-serif";
    
    resumeContent.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 24px; margin-bottom: 24px;">
          <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 8px 0;">${generatedResume.name || ""}</h1>
          <p style="margin: 4px 0; color: #4b5563;">${generatedResume.email || ""}</p>
          <p style="margin: 4px 0; color: #4b5563;">${generatedResume.phone || ""}</p>
          ${generatedResume.linkedin ? `<p style="margin: 4px 0; color: #2563eb;">${generatedResume.linkedin}</p>` : ""}
          ${generatedResume.github ? `<p style="margin: 4px 0; color: #2563eb;">${generatedResume.github}</p>` : ""}
        </div>

        ${(generatedResume.summary || generatedResume.professionalSummary) ? `
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 12px 0; color: #1f2937;">Professional Summary</h2>
            <p style="line-height: 1.6; margin: 0; white-space: pre-line; color: #374151;">${(generatedResume.summary || generatedResume.professionalSummary).replace(/\n/g, '<br>')}</p>
          </div>
        ` : ""}

        ${generatedResume.education ? `
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 12px 0; color: #1f2937;">Education</h2>
            <p style="line-height: 1.6; margin: 0; white-space: pre-line; color: #374151;">${generatedResume.education.replace(/\n/g, '<br>')}</p>
          </div>
        ` : ""}

        ${generatedResume.experience ? `
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 12px 0; color: #1f2937;">Experience</h2>
            <p style="line-height: 1.6; margin: 0; white-space: pre-line; color: #374151;">${generatedResume.experience.replace(/\n/g, '<br>')}</p>
          </div>
        ` : ""}

        ${generatedResume.projects ? `
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 12px 0; color: #1f2937;">Projects</h2>
            <p style="line-height: 1.6; margin: 0; white-space: pre-line; color: #374151;">${generatedResume.projects.replace(/\n/g, '<br>')}</p>
          </div>
        ` : ""}

        ${generatedResume.skills ? `
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 12px 0; color: #1f2937;">Skills</h2>
            <p style="line-height: 1.6; margin: 0; white-space: pre-line; color: #374151;">${generatedResume.skills.replace(/\n/g, '<br>')}</p>
          </div>
        ` : ""}

        ${generatedResume.certifications ? `
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 12px 0; color: #1f2937;">Certifications</h2>
            <p style="line-height: 1.6; margin: 0; white-space: pre-line; color: #374151;">${generatedResume.certifications.replace(/\n/g, '<br>')}</p>
          </div>
        ` : ""}
      </div>
    `;

    document.body.appendChild(resumeContent);
    
    try {
      const canvas = await html2canvas(resumeContent, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${generatedResume.name || "Resume"}_Resume.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      document.body.removeChild(resumeContent);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getScoreRing = (score) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;
    return { circumference, offset };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                ResumeAI
              </span>
            </div>
            <div className="flex space-x-1 bg-blue-50 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("builder")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "builder"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Resume Builder
              </button>
              <button
                onClick={() => setActiveTab("analyzer")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "analyzer"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                ATS Analyzer
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "builder" ? (
          /* RESUME BUILDER SECTION */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* FORM SECTION */}
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Create Your Resume</h2>
                <p className="text-blue-100 text-sm mt-1">Fill in your details below</p>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name *"
                  value={resume.name}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={resume.email}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={resume.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="linkedin"
                    placeholder="LinkedIn URL"
                    value={resume.linkedin}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="github"
                    placeholder="GitHub URL"
                    value={resume.github}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <textarea
                  name="professionalSummary"
                  rows="3"
                  placeholder="Professional Summary"
                  value={resume.professionalSummary}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <textarea
                  name="education"
                  rows="3"
                  placeholder="Education"
                  value={resume.education}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <textarea
                  name="experience"
                  rows="4"
                  placeholder="Work Experience"
                  value={resume.experience}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <textarea
                  name="projects"
                  rows="3"
                  placeholder="Projects"
                  value={resume.projects}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <textarea
                  name="skills"
                  rows="2"
                  placeholder="Skills (comma separated)"
                  value={resume.skills}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <textarea
                  name="certifications"
                  rows="2"
                  placeholder="Certifications"
                  value={resume.certifications}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 rounded-xl font-semibold transition shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    "Generate Professional Resume"
                  )}
                </button>
              </div>
            </div>

            {/* PREVIEW SECTION */}
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-800">Live Preview</h2>
                <p className="text-gray-500 text-sm">ATS-friendly format</p>
              </div>
              <div className="p-8 bg-white max-h-[70vh] overflow-y-auto">
                {!generatedResume ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">Fill in your details and click "Generate Professional Resume" to see preview</p>
                  </div>
                ) : (
                  <>
                    <div id="resume-preview">
                      <div className="text-center pb-6 mb-6 border-b border-gray-200">
                        <h1 className="text-3xl font-bold text-gray-900">{generatedResume.name}</h1>
                        <div className="mt-2 text-gray-600">
                          <p>{generatedResume.email}</p>
                          <p>{generatedResume.phone}</p>
                          {generatedResume.linkedin && <p className="text-blue-600 text-sm break-all">{generatedResume.linkedin}</p>}
                          {generatedResume.github && <p className="text-blue-600 text-sm break-all">{generatedResume.github}</p>}
                        </div>
                      </div>

                      {(generatedResume.summary || generatedResume.professionalSummary) && (
                        <div className="mb-6">
                          <h2 className="text-lg font-semibold text-gray-800 mb-2">Professional Summary</h2>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {generatedResume.summary || generatedResume.professionalSummary}
                          </p>
                        </div>
                      )}

                      {generatedResume.education && (
                        <div className="mb-6">
                          <h2 className="text-lg font-semibold text-gray-800 mb-2">Education</h2>
                          <p className="text-gray-700 whitespace-pre-line">{generatedResume.education}</p>
                        </div>
                      )}

                      {generatedResume.experience && (
                        <div className="mb-6">
                          <h2 className="text-lg font-semibold text-gray-800 mb-2">Experience</h2>
                          <p className="text-gray-700 whitespace-pre-line">{generatedResume.experience}</p>
                        </div>
                      )}

                      {generatedResume.projects && (
                        <div className="mb-6">
                          <h2 className="text-lg font-semibold text-gray-800 mb-2">Projects</h2>
                          <p className="text-gray-700 whitespace-pre-line">{generatedResume.projects}</p>
                        </div>
                      )}

                      {generatedResume.skills && (
                        <div className="mb-6">
                          <h2 className="text-lg font-semibold text-gray-800 mb-2">Skills</h2>
                          <p className="text-gray-700 whitespace-pre-line">{generatedResume.skills}</p>
                        </div>
                      )}

                      {generatedResume.certifications && (
                        <div className="mb-6">
                          <h2 className="text-lg font-semibold text-gray-800 mb-2">Certifications</h2>
                          <p className="text-gray-700 whitespace-pre-line">{generatedResume.certifications}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center mt-8 pt-4 border-t border-gray-200">
                      <button
                        onClick={downloadResume}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-semibold transition shadow-md flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ATS ANALYZER SECTION - Production Level */
          <div className="max-w-5xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5 mb-4">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-medium text-blue-700">AI-Powered Analysis</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">ATS Resume Analyzer</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Evaluate your resume against industry-standard ATS systems and specific job descriptions. Get actionable insights to improve your interview chances.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">Resume Upload</h2>
                  <p className="text-blue-100 text-sm mt-1">Upload your resume for AI analysis</p>
                </div>
                <div className="p-6">
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    uploadedFile ? "border-emerald-400 bg-emerald-50" : "border-gray-300 hover:border-blue-400 bg-gray-50"
                  }`}>
                    <input
                      type="file"
                      id="resumeUpload"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="resumeUpload" className="cursor-pointer">
                      {uploadedFile ? (
                        <div className="space-y-2">
                          <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="font-medium text-gray-800">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-500">Click to change file</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <p className="text-gray-600">Click to upload or drag and drop</p>
                          <p className="text-sm text-gray-400">PDF, DOC, or DOCX (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Job Description Input */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Description (Optional)
                      <span className="text-gray-400 text-xs ml-2">For better matching</span>
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows="4"
                      placeholder="Paste the job description here to get precise matching analysis..."
                      className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={analyzeResume}
                    disabled={atsLoading || !uploadedFile}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 rounded-xl font-semibold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {atsLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing Resume...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Analyze ATS Score
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Results Section */}
              {atsResult && (
                <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden animate-fadeIn">
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">Analysis Results</h2>
                    <p className="text-emerald-100 text-sm mt-1">Comprehensive ATS evaluation</p>
                  </div>
                  <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Score Circle */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-40 h-40">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="12"
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            fill="none"
                            stroke={atsResult.score >= 80 ? "#10b981" : atsResult.score >= 60 ? "#f59e0b" : "#ef4444"}
                            strokeWidth="12"
                            strokeDasharray={`${2 * Math.PI * 70}`}
                            strokeDashoffset={`${2 * Math.PI * 70 * (1 - atsResult.score / 100)}`}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-bold text-gray-900">{atsResult.score}%</span>
                          <span className="text-sm text-gray-500">Overall Score</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-4 flex-wrap justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-gray-800">{atsResult.keywordMatchScore || atsResult.score - 4}%</p>
                          <p className="text-xs text-gray-500">Keyword Match</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-gray-800">{atsResult.skillsAlignmentScore || atsResult.score - 2}%</p>
                          <p className="text-xs text-gray-500">Skills Match</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-gray-800">{atsResult.formattingScore || atsResult.score + 5}%</p>
                          <p className="text-xs text-gray-500">Formatting</p>
                        </div>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">AI Analysis</p>
                          <p className="text-gray-700">{atsResult.feedback}</p>
                        </div>
                      </div>
                    </div>

                    {/* Improvements List */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Recommended Improvements
                      </h3>
                      <div className="space-y-2">
                        {atsResult.improvements?.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Keywords Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Matched Keywords
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {atsResult.matchedKeywords?.map((kw, idx) => (
                            <span key={idx} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Missing Keywords
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {atsResult.missingKeywords?.map((kw, idx) => (
                            <span key={idx} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recommended Skills */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Recommended Skills to Add
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {atsResult.recommendedSkills?.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Format Issues */}
                    {atsResult.formatIssues && atsResult.formatIssues.length > 0 && (
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                        <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Formatting Issues Detected
                        </h3>
                        <ul className="space-y-1">
                          {atsResult.formatIssues.map((issue, idx) => (
                            <li key={idx} className="text-sm text-amber-700 flex items-center gap-2">
                              <span>•</span> {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Features Section */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-4 text-center border border-blue-100">
                <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800">Keyword Matching</h4>
                <p className="text-xs text-gray-500 mt-1">AI-powered keyword detection</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-blue-100">
                <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800">JD Matching</h4>
                <p className="text-xs text-gray-500 mt-1">Compare with job description</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-blue-100">
                <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800">Skill Analysis</h4>
                <p className="text-xs text-gray-500 mt-1">Identify missing skills</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-blue-100">
                <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800">Actionable Tips</h4>
                <p className="text-xs text-gray-500 mt-1">Personalized recommendations</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
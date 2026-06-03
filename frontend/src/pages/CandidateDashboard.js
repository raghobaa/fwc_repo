import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAllJobs } from "../api/api";

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [showJobs, setShowJobs] = useState(false);
  const [resumeFiles, setResumeFiles] = useState({});
  const [candidateData, setCandidateData] = useState({});
  const [onboardingStatus, setOnboardingStatus] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const res = await fetch(`${BASE}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const me = await res.json();
        setOnboardingStatus(me?.onboardingStatus || "");
      } catch {}
    };
    loadUser();
  }, []);

  const handleFindJobs = async () => {
    const { data } = await getAllJobs();
    setJobs(data);
    setShowJobs(true);
  };

  const handleInputChange = (e, jobId) => {
    const { name, value } = e.target;
    setCandidateData((prev) => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        [name]: value,
      },
    }));
  };

  const handleFileChange = (e, jobId) => {
    const file = e.target.files[0];
    setResumeFiles((prev) => ({
      ...prev,
      [jobId]: file,
    }));
  };

  const handleApply = async (jobId) => {
    const data = candidateData[jobId] || {};
    const resumeFile = resumeFiles[jobId];

    if (!resumeFile) {
      alert("Please upload your resume first");
      return;
    }

    if (!data.name || !data.email) {
      alert("Please enter your name and email");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("name", data.name);
    formData.append("email", data.email);

    try {
      const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await fetch(`${BASE}/api/jobs/${jobId}/apply`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Application submitted successfully!");
        setCandidateData((prev) => ({
          ...prev,
          [jobId]: { name: "", email: "" },
        }));
        setResumeFiles((prev) => ({
          ...prev,
          [jobId]: null,
        }));
      } else {
        alert("Failed to apply for the job");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  const features = [
    {
      title: "Onboarding",
      description:
        `Your current onboarding status: ${onboardingStatus || "Unavailable"}`,
      onClick: () => navigate("/candidate/onboarding"),
    },
    {
      title: "My Interviews",
      description:
        "View your scheduled interviews and join the live interview room.",
      onClick: () => navigate("/candidate/interviews"),
    },
    {
      title: "AI Interview",
      description: "Take mock interviews with AI interviewer and get feedback.",
      buttonText: "Start AI Interview",
      color: "yellow",
      onClick: () => navigate("/candidate/ai_interview"),
    },
    {
      title: "Discover Jobs",
      description:
        "Explore a wide range of job openings tailored to your skills and interests. Apply in one click.",
      onClick: handleFindJobs,
    },
    {
      title: "Resume Builder",
      description:
        "Create a polished, professional resume with AI-powered writing and formatting suggestions.",
      onClick: () => alert("Resume Builder feature coming soon!"),
    },
    {
      title: "Skill Tracker",
      description:
        "Track your skill development journey, set goals, and measure your progress over time.",
      onClick: () => alert("Skill Tracker feature coming soon!"),
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-8 pt-20 text-gray-800 font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-10 tracking-tight text-center">
          Candidate Dashboard
        </h1>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {features.map((f, i) => (
            <div
              key={i}
              onClick={f.onClick}
              className="cursor-pointer bg-white rounded-2xl shadow-lg border border-gray-200 p-8 flex flex-col justify-between h-48 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-[#1E3A8A]">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-600 leading-snug line-clamp-3">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Job Section */}
        {showJobs && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Available Jobs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.length > 0 ? (
                jobs.map((job) => {
                  const data = candidateData[job._id] || { name: "", email: "" };
                  return (
                    <div
                      key={job._id}
                      className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col justify-between hover:shadow-lg transition"
                    >
                      {/* Job Info */}
                      <div>
                        <h3 className="text-lg font-semibold mb-1 text-gray-800 capitalize">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {job.description}
                        </p>
                        <p className="text-sm text-gray-500 font-medium">
                          {job.location}
                        </p>
                      </div>

                      {/* Form */}
                      <div className="mt-4 space-y-3">
                        <input
                          type="text"
                          name="name"
                          placeholder="Your Name"
                          value={data.name}
                          onChange={(e) => handleInputChange(e, job._id)}
                          className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                        />
                        <input
                          type="email"
                          name="email"
                          placeholder="Your Email"
                          value={data.email}
                          onChange={(e) => handleInputChange(e, job._id)}
                          className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                        />
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange(e, job._id)}
                          className="block w-full text-sm text-gray-600 cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#1E3A8A] file:text-white hover:file:bg-[#162c6a] transition"
                        />

                        <button
                          onClick={() => handleApply(job._id)}
                          className="w-full bg-[#1E3A8A] hover:bg-[#162c6a] text-white py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md focus:outline-none"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center col-span-full text-gray-500">
                  No jobs available yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

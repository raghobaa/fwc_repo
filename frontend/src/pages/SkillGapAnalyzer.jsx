import React, { useState } from 'react';
import axios from 'axios';
import { 
  Target, CheckCircle, XCircle, AlertCircle, 
  Clock, BookOpen, TrendingUp, Zap,
  ArrowRight, Upload, FileText, Award,
  Brain, Calendar, Star, Flame
} from 'lucide-react';

export default function SkillGapAnalyzer() {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      console.log("Analyzing with token:", token ? "Token exists" : "No token");
      console.log("API URL:", `${BASE_URL}/api/skill-gap/analyze`);
      
      const response = await axios.post(
        `${BASE_URL}/api/skill-gap/analyze`,
        { jobDescription },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      console.log("Response received:", response.data);
      setResult(response.data);
    } catch (err) {
      console.error("Error details:", err);
      
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please make sure backend is running on port 5002');
      } else if (err.response) {
        setError(err.response?.data?.error || `Server error: ${err.response.status}`);
      } else if (err.request) {
        setError('No response from server. Please check if backend is running.');
      } else {
        setError(err.message || 'Analysis failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchBgColor = (score) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-4">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">AI POWERED</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Skill Gap Analyzer</h1>
          <p className="text-gray-600">Paste any job description to see how well you match and what you need to learn</p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows="8"
            placeholder="Paste job description from LinkedIn, Naukri, Indeed, or any job portal here..."
            className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Analyze Skills Gap
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600 font-medium">Error:</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <p className="text-gray-500 text-xs mt-2">
              Make sure backend is running on port 5001 and you are logged in.
            </p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Job Title & Match Score */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <p className="text-sm opacity-90">Analyzed Job Role</p>
                  <h2 className="text-2xl font-bold mt-1">{result.jobTitle}</h2>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold">{result.matchScore}%</div>
                  <p className="text-sm opacity-90 mt-1">Match Score</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className={`${getMatchBgColor(result.matchScore)} rounded-full h-2 transition-all duration-500`}
                    style={{ width: `${result.matchScore}%` }}
                  />
                </div>
                <p className="text-sm mt-2 opacity-90">{result.message}</p>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Matched Skills */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-bold text-gray-900">Matched Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.matchedSkills?.length > 0 ? (
                    result.matchedSkills.map((skill, i) => (
                      <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No matching skills found</p>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <h3 className="text-lg font-bold text-gray-900">Missing Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills?.length > 0 ? (
                    result.missingSkills.map((skill, i) => (
                      <span key={i} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Great! No missing skills</p>
                  )}
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">AI Recommendations</h3>
              </div>
              <div className="space-y-3">
                {result.recommendations?.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Roadmap */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">Personalized Learning Roadmap</h3>
              </div>
              <div className="space-y-4">
                {result.learningRoadmap?.map((item, i) => (
                  <div key={i} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.topic}</h4>
                        <p className="text-sm text-gray-500">Priority: {item.priority}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{item.estimatedHours} hours</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
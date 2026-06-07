
import React, { useState, useEffect } from 'react';
import { Plus, Zap, TrendingUp, CheckCircle, AlertCircle, Clock, Trash2 } from 'lucide-react';

export default function AiIdeaHubPage() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'General' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('Employee');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [lastSubmittedIdea, setLastSubmittedIdea] = useState(null);

  const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'Employee';
    setUserRole(role);
    fetchIdeas(role);
  }, []);

  const fetchIdeas = async (role = userRole) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = role === 'HR' || role === 'Admin' ? '/api/ideas/all' : '/api/ideas/my-ideas';
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIdeas(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert('Please fill title and description');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/ideas/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const responseData = await res.json();
        alert('Idea submitted successfully!');
        setLastSubmittedIdea(responseData.idea);
        setShowEvaluation(true);
        setShowForm(false);
        setFormData({ title: '', description: '', category: 'General' });
        setTimeout(() => fetchIdeas(), 2000);
      } else if (res.status === 409) {
        const data = await res.json();
        setError(`Similar idea exists: "${data.duplicate.title}" (${data.duplicate.status})`);
      } else {
        const err = await res.json();
        setError(err.message || 'Submission failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (ideaId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/ideas/${ideaId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchIdeas();
      } else {
        alert('Update failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteIdea = (id) => {
    setIdeaToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteIdea = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/ideas/${ideaToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('✓ Idea deleted successfully');
        fetchIdeas();
        setShowDeleteConfirm(false);
        setIdeaToDelete(null);
      } else {
        const data = await res.json();
        alert(`Error: ${data.message || 'Unable to delete idea'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error: Unable to delete idea');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEvaluationMetrics = (idea) => {
    const score = idea.overallScore || 0;
    return {
      potential: score >= 75 ? '★★★★★' : score >= 60 ? '★★★★☆' : score >= 45 ? '★★★☆☆' : '★★☆☆☆',
      growthPotential: score >= 75 ? 'Very High' : score >= 60 ? 'High' : score >= 45 ? 'Medium' : 'Low',
      businessValue: idea.impactScore >= 70 ? 'High' : idea.impactScore >= 50 ? 'Medium' : 'Low',
      implementationEase: idea.feasibilityScore >= 70 ? 'Easy' : idea.feasibilityScore >= 50 ? 'Moderate' : 'Challenging',
      recommendation: score >= 75 ? '🚀 Worth Pursuing' : score >= 60 ? '✓ Good Potential' : '⚠️ Needs Improvement',
      strength: idea.innovationScore >= 70 ? 'Strong' : idea.innovationScore >= 50 ? 'Moderate' : 'Developing',
      creativity: idea.innovationScore >= 70 ? 'Good' : 'Average',
      expectedImpact: idea.impactScore >= 70 ? 'Promising' : idea.impactScore >= 50 ? 'Moderate' : 'Limited',
      executionDifficulty: idea.feasibilityScore >= 70 ? 'Easy' : idea.feasibilityScore >= 50 ? 'Medium' : 'Challenging',
      finalDecision: score >= 75 ? '✓ Recommended for Review' : score >= 60 ? '△ Under Consideration' : '✕ Needs Refinement',
      status: score >= 75 ? '🟢 High Potential' : score >= 60 ? '🟡 Medium Potential' : '🔴 Low Potential'
    };
  };

  const renderMetricBar = (label, value, maxValue = 100) => {
    const percentage = (value / maxValue) * 100;
    let bgColor = 'bg-green-500';
    if (percentage < 50) bgColor = 'bg-red-500';
    else if (percentage < 70) bgColor = 'bg-yellow-500';
    
    return (
      <div key={label} className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-bold text-gray-900">{value}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full ${bgColor} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    );
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'implemented': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      implemented: 'bg-blue-100 text-blue-800'
    };
    return <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>{getStatusIcon(status)} {status.toUpperCase()}</span>;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - PROMINENT */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white drop-shadow-lg">Innovation Hub</h1>
              <p className="text-white text-base font-semibold mt-2 drop-shadow">Share, Evaluate & Transform Ideas Into Reality</p>
            </div>
          </div>
          
          {/* Feature Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 bg-white bg-opacity-25 px-4 py-3 rounded-xl backdrop-blur-md border border-white border-opacity-30">
              <Zap className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm">AI Evaluation</span>
            </div>
            <div className="flex items-center gap-2 bg-white bg-opacity-25 px-4 py-3 rounded-xl backdrop-blur-md border border-white border-opacity-30">
              <TrendingUp className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm">Smart Scoring</span>
            </div>
            <div className="flex items-center gap-2 bg-white bg-opacity-25 px-4 py-3 rounded-xl backdrop-blur-md border border-white border-opacity-30">
              <AlertCircle className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm">Duplicate Check</span>
            </div>
            <div className="flex items-center gap-2 bg-white bg-opacity-25 px-4 py-3 rounded-xl backdrop-blur-md border border-white border-opacity-30">
              <CheckCircle className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm">HR Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Employee Submit Section */}
        {userRole === 'Employee' && (
          <div className="mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-3 font-semibold text-lg shadow-lg transition-all"
            >
              <Plus className="h-6 w-6" />
              Submit Your Innovative Idea
            </button>
          </div>
        )}

        {/* HR Header */}
        {(userRole === 'HR' || userRole === 'Admin') && (
          <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Ideas Pending Review</h2>
                <p className="text-gray-600 text-sm mt-1">Evaluate and manage employee innovations</p>
              </div>
            </div>
          </div>
        )}

        {/* Ideas Grid/List */}
        <div className="space-y-4">
          {ideas.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No ideas yet. Be the first to share an innovative idea!</p>
            </div>
          ) : (
            ideas.map((idea) => (
              <div key={idea._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{idea.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">By <span className="font-medium">{idea.submittedByName}</span> • {new Date(idea.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(idea.status)}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mb-4 leading-relaxed">{idea.description}</p>

                  {/* Category Tag */}
                  <div className="mb-4">
                    <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">{idea.category}</span>
                  </div>

                  {/* Scores Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">Innovation</p>
                      <p className={`text-3xl font-bold mt-1 ${getScoreColor(idea.innovationScore)}`}>{idea.innovationScore}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">Impact</p>
                      <p className={`text-3xl font-bold mt-1 ${getScoreColor(idea.impactScore)}`}>{idea.impactScore}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">Feasibility</p>
                      <p className={`text-3xl font-bold mt-1 ${getScoreColor(idea.feasibilityScore)}`}>{idea.feasibilityScore}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">Overall</p>
                      <p className={`text-3xl font-bold mt-1 ${getScoreColor(idea.overallScore)}`}>{idea.overallScore}</p>
                    </div>
                  </div>

                  {/* AI Summary */}
                  {idea.aiSummary && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900"><span className="font-semibold">AI Analysis:</span> {idea.aiSummary}</p>
                    </div>
                  )}

                  {/* Action Buttons for HR */}
                  {(userRole === 'HR' || userRole === 'Admin') && idea.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button onClick={() => updateStatus(idea._id, 'approved')} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition">
                        ✓ Approve
                      </button>
                      <button onClick={() => updateStatus(idea._id, 'rejected')} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition">
                        ✕ Reject
                      </button>
                    </div>
                  )}

                  {/* Delete Button for Submitter */}
                  {userRole === 'Employee' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button onClick={() => deleteIdea(idea._id)} className="flex items-center justify-center gap-2 flex-1 text-white bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg font-semibold transition shadow-md">
                        <Trash2 className="h-5 w-5" />
                        Delete This Idea
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Idea Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Submit Your Idea</h2>
              <button onClick={() => setShowForm(false)} className="text-2xl leading-none opacity-70 hover:opacity-100">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Idea Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., AI-powered employee scheduling system"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>General</option>
                  <option>Technology</option>
                  <option>Process Improvement</option>
                  <option>Product</option>
                  <option>Marketing</option>
                  <option>Sustainability</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Description *</label>
                <textarea
                  rows="6"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your idea in detail. What problem does it solve? How would it benefit the organization?"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">Duplicate Idea Detected</p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                      <p className="text-xs text-red-600 mt-2">💡 Please review the existing idea before submitting a similar one.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Idea'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="bg-red-600 text-white px-6 py-4 rounded-t-2xl flex items-center gap-3">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-bold">Delete Idea</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">Are you sure you want to delete this idea? This action cannot be undone and you won't be able to recover it.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-900 px-4 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteIdea}
                  disabled={deleteLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Idea Evaluation Dashboard */}
      {showEvaluation && lastSubmittedIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white px-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black">🎉 Idea Submitted Successfully!</h2>
                  <p className="text-blue-100 mt-2">Your idea has been evaluated with AI-powered analytics</p>
                </div>
                <button onClick={() => setShowEvaluation(false)} className="text-3xl leading-none opacity-70 hover:opacity-100">×</button>
              </div>
            </div>

            <div className="p-8">
              {(() => {
                const metrics = getEvaluationMetrics(lastSubmittedIdea);
                return (
                  <div className="space-y-8">
                    {/* Idea Title */}
                    <div className="border-l-4 border-blue-600 pl-4">
                      <h3 className="text-2xl font-bold text-gray-900">{lastSubmittedIdea.title}</h3>
                      <p className="text-gray-600 mt-1">{lastSubmittedIdea.description}</p>
                    </div>

                    {/* Overall Score & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
                        <p className="text-sm text-gray-600 font-semibold">OVERALL SCORE</p>
                        <p className="text-5xl font-black text-blue-600 mt-2">{lastSubmittedIdea.overallScore}%</p>
                        <p className="text-xs text-gray-600 mt-2">Based on AI evaluation</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
                        <p className="text-sm text-gray-600 font-semibold">STATUS</p>
                        <p className="text-2xl font-bold text-green-700 mt-2">{metrics.status}</p>
                        <p className="text-xs text-gray-600 mt-2">{metrics.finalDecision}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
                        <p className="text-sm text-gray-600 font-semibold">POTENTIAL</p>
                        <p className="text-xl font-bold text-purple-700 mt-2">{metrics.potential}</p>
                        <p className="text-xs text-gray-600 mt-2">{metrics.recommendation}</p>
                      </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-bold text-gray-900 mb-3">💡 Idea Potential</p>
                        <p className="text-lg font-bold text-yellow-600 mb-1">{metrics.potential}</p>
                        <p className="text-xs text-gray-600">{(lastSubmittedIdea.overallScore / 20).toFixed(1)}/5 Rating</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-bold text-gray-900 mb-3">🔥 Growth Potential</p>
                        <p className="text-lg font-bold text-red-600">{metrics.growthPotential}</p>
                        <div className="mt-2 w-full h-1.5 bg-gray-300 rounded-full overflow-hidden">
                          <div className={`h-full transition-all ${lastSubmittedIdea.overallScore >= 75 ? 'bg-red-600 w-full' : lastSubmittedIdea.overallScore >= 60 ? 'bg-yellow-500 w-3/4' : 'bg-orange-500 w-1/2'}`}></div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-bold text-gray-900 mb-3">🎯 Business Value</p>
                        <p className="text-lg font-bold text-blue-600">{metrics.businessValue}</p>
                        <div className="mt-2 w-full h-1.5 bg-gray-300 rounded-full overflow-hidden">
                          <div className={`h-full transition-all ${lastSubmittedIdea.impactScore >= 70 ? 'bg-blue-600 w-full' : lastSubmittedIdea.impactScore >= 50 ? 'bg-blue-400 w-2/3' : 'bg-blue-300 w-1/3'}`}></div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-bold text-gray-900 mb-3">⚡ Implementation Ease</p>
                        <p className="text-lg font-bold text-green-600">{metrics.implementationEase}</p>
                        <div className="mt-2 w-full h-1.5 bg-gray-300 rounded-full overflow-hidden">
                          <div className={`h-full transition-all ${lastSubmittedIdea.feasibilityScore >= 70 ? 'bg-green-600 w-full' : lastSubmittedIdea.feasibilityScore >= 50 ? 'bg-green-400 w-2/3' : 'bg-green-300 w-1/3'}`}></div>
                        </div>
                      </div>
                    </div>

                    {/* AI Verdict Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">🚀 AI Verdict</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-600">Idea Strength</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">{metrics.strength}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-600">Creativity Level</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">{metrics.creativity}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-600">Expected Impact</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">{metrics.expectedImpact}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-600">Execution Difficulty</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">{metrics.executionDifficulty}</p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Score Bars */}
                    <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">📊 Detailed Evaluation Scores</h4>
                      <div className="space-y-4">
                        {renderMetricBar('🎨 Innovation Score', lastSubmittedIdea.innovationScore)}
                        {renderMetricBar('💥 Impact Score', lastSubmittedIdea.impactScore)}
                        {renderMetricBar('✅ Feasibility Score', lastSubmittedIdea.feasibilityScore)}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">✓ Benefits</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-3">
                          <span className="text-green-600 font-bold text-lg">✓</span>
                          <span className="text-gray-700">Improves Productivity & Efficiency</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-green-600 font-bold text-lg">✓</span>
                          <span className="text-gray-700">Easy to Implement with Current Resources</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-green-600 font-bold text-lg">✓</span>
                          <span className="text-gray-700">Valuable for Employees & Organization</span>
                        </li>
                      </ul>
                    </div>

                    {/* AI Suggestion */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-300">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">💡 AI Suggestion</h4>
                      <p className="text-gray-800 leading-relaxed">
                        <span className="font-semibold">Submit this idea to HR for further evaluation.</span> Your idea demonstrates strong potential with an overall score of <span className="font-bold text-orange-600">{lastSubmittedIdea.overallScore}%</span> and shows promising characteristics for implementation. The HR team will review it in detail and provide feedback.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowEvaluation(false)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md"
                      >
                        ✓ Got it, Close
                      </button>
                      <button
                        onClick={() => { setShowEvaluation(false); fetchIdeas(); }}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold transition"
                      >
                        📋 View All Ideas
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
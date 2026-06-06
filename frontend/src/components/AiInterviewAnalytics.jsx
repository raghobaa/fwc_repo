import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Doughnut, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { io } from 'socket.io-client';
import './AiInterviewAnalytics.css';

const API_BASE = 'http://localhost:8000/api';

const AiInterviewAnalytics = ({ candidateId }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [recruiterView, setRecruiterView] = useState(null);
  const socketRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    socketRef.current = io(`ws://localhost:8000/ws/${candidateId}`);
    
    socketRef.current.on('dashboard_update', (data) => {
      setDashboardData(data.data);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [candidateId]);

  // Fetch initial dashboard data
  useEffect(() => {
    fetchDashboard();
    fetchRecruiterView();
  }, [candidateId]);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE}/candidate/${candidateId}/dashboard`);
      const data = await response.json();
      setDashboardData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setLoading(false);
    }
  };

  const fetchRecruiterView = async () => {
    try {
      const response = await fetch(`${API_BASE}/candidate/${candidateId}/recruiter-view`);
      const data = await response.json();
      setRecruiterView(data);
    } catch (error) {
      console.error('Error fetching recruiter view:', error);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    try {
      const response = await fetch(`${API_BASE}/candidate/${candidateId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput })
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading AI Analytics...</div>;
  }

  const { scores, trends, weak_topics, stress_analysis, radar_scores, rejection_analytics, opportunities } = dashboardData || {};

  // Prepare chart data
  const trendData = trends?.trends?.map((score, idx) => ({
    interview: `Interview ${idx + 1}`,
    score: score
  })) || [];

  const radarData = radar_scores ? Object.entries(radar_scores).map(([skill, score]) => ({
    skill: skill.replace('_', ' ').toUpperCase(),
    score: score
  })) : [];

  const rejectionData = rejection_analytics?.rejection_reasons ? 
    Object.entries(rejection_analytics.rejection_reasons).map(([reason, percentage]) => ({
      reason: reason,
      percentage: percentage
    })) : [];

  return (
    <div className="ai-analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <h1>🎯 AI Interview Analytics & Career Intelligence</h1>
        <div className="header-info">
          <span className="badge">Candidate: {candidateId}</span>
          <button onClick={fetchDashboard} className="refresh-btn">🔄 Refresh</button>
        </div>
      </div>

      {/* Score Cards Grid */}
      <div className="scores-grid">
        <ScoreCard title="Overall Readiness" score={scores?.overall_readiness} icon="🎯" />
        <ScoreCard title="Technical Readiness" score={scores?.technical_readiness} icon="💻" />
        <ScoreCard title="Communication" score={scores?.communication_score} icon="🗣️" />
        <ScoreCard title="Problem Solving" score={scores?.problem_solving_score} icon="🧩" />
        <ScoreCard title="Confidence" score={scores?.confidence_score} icon="💪" />
        <ScoreCard title="Behavioral" score={scores?.behavioral_readiness} icon="🤝" />
        <ScoreCard title="Leadership" score={scores?.leadership_score} icon="👔" />
        <StressCard stressAnalysis={stress_analysis} />
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>📈 Score Trends Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="interview" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#667eea" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          {trends?.insight && (
            <div className="insight-card">
              💡 {trends.insight}
            </div>
          )}
        </div>

        <div className="chart-card">
          <h3>🎯 Readiness Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar dataKey="score" stroke="#764ba2" fill="#667eea" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Topics Analysis */}
      <div className="topics-section">
        <h3>📚 Topic Analysis</h3>
        <div className="topics-grid">
          <div>
            <h4>✅ Strong Topics</h4>
            <ul className="topic-list">
              {weak_topics?.strong_topics?.map(topic => (
                <li key={topic} className="topic-strong">{topic}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>⚠️ Needs Improvement</h4>
            <ul className="topic-list">
              {weak_topics?.weak_topics?.map(topic => (
                <li key={topic} className="topic-weak">{topic}</li>
              ))}
            </ul>
          </div>
        </div>
        {weak_topics?.insight && (
          <div className="insight-card">
            💡 {weak_topics.insight}
          </div>
        )}
      </div>

      {/* Rejection Intelligence & Opportunities */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>💼 Rejection Intelligence</h3>
          <ResponsiveContainer width="100%" height={250}>
            <Doughnut data={rejectionData} 
              dataKey="percentage" 
              nameKey="reason"
              cx="50%" cy="50%" outerRadius={80}>
              <Tooltip />
              <Legend />
            </Doughnut>
          </ResponsiveContainer>
          {rejection_analytics?.insight && (
            <div className="insight-card">
              💡 {rejection_analytics.insight}
            </div>
          )}
          <div className="stats-mini">
            <div>📊 Applied: {rejection_analytics?.total_applied || 0}</div>
            <div>❌ Rejected: {rejection_analytics?.rejected_count || 0}</div>
            <div>✅ Shortlisted: {rejection_analytics?.shortlisted_count || 0}</div>
          </div>
        </div>

        <div className="chart-card">
          <h3>🚀 Opportunity Unlock</h3>
          <div className="opportunity-content">
            <div className="current-jobs">
              <span className="big-number">{opportunities?.current_eligible_jobs || 0}</span>
              <span>Current Eligible Jobs</span>
            </div>
            {opportunities?.opportunities?.map(opp => (
              <div key={opp.skill} className="opportunity-item">
                <div className="opportunity-skill">Learn {opp.skill}</div>
                <div className="opportunity-value">
                  +{opp.unlock_value} jobs → {opp.new_eligible} total
                </div>
              </div>
            ))}
            {opportunities?.insight && (
              <div className="insight-card small">
                💡 {opportunities.insight}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recruiter View */}
      {recruiterView && (
        <div className="recruiter-section">
          <h3>📊 Recruiter View Simulator</h3>
          <div className="recruiter-metrics">
            <MetricBadge label="ATS Score" value={recruiterView.ats_score} />
            <MetricBadge label="Resume Quality" value={recruiterView.resume_quality_score} />
            <MetricBadge label="Skill Match" value={recruiterView.skill_match_score} />
            <MetricBadge label="First Impression" value={recruiterView.first_impression_score} />
          </div>
          {recruiterView.red_flags?.length > 0 && (
            <div className="red-flags">
              ⚠️ Red Flags: {recruiterView.red_flags.join(', ')}
            </div>
          )}
          <div className="insight-card">
            💼 {recruiterView.recruiter_feedback}
          </div>
        </div>
      )}

      {/* AI Career Coach Chat */}
      <div className="chat-section">
        <h3>💬 AI Career Coach</h3>
        <div className="chat-messages">
          <div className="message assistant-message">
            👋 Hi! I'm your AI Career Coach. Ask me anything about your interview performance, 
            career opportunities, or what skills to learn next!
          </div>
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}>
              {msg.content}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
            placeholder="Ask me anything about your career..."
          />
          <button onClick={sendChatMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const ScoreCard = ({ title, score, icon }) => (
  <div className="score-card">
    <div className="score-title">{icon} {title}</div>
    <div className="score-value">{Math.round(score || 0)}%</div>
    <div className="score-trend">
      {score > 70 ? '↑ Excellent' : score > 40 ? '→ Average' : '↓ Needs Work'}
    </div>
  </div>
);

const StressCard = ({ stressAnalysis }) => (
  <div className="score-card stress-card">
    <div className="score-title">😰 Stress Level</div>
    <div className="score-value">{Math.round(stressAnalysis?.stress_score || 0)}%</div>
    <div className="score-trend">
      {stressAnalysis?.insight?.substring(0, 50)}...
    </div>
  </div>
);

const MetricBadge = ({ label, value }) => (
  <div className="metric-badge">
    <span className="metric-label">{label}</span>
    <span className="metric-value">{Math.round(value || 0)}%</span>
  </div>
);

export default AiInterviewAnalytics;
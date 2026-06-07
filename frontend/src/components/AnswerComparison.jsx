import React, { useState } from 'react';

const API_BASE = 'http://localhost:8000/api';

const AnswerComparison = ({ candidateId }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  const compareAnswer = async () => {
    if (!question || !answer) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/candidate/${candidateId}/answer-comparison`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, candidate_answer: answer })
      });
      const data = await response.json();
      setComparison(data);
    } catch (error) {
      console.error('Comparison error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="answer-comparison">
      <h3>📝 Answer Comparison Engine</h3>
      
      <div className="comparison-inputs">
        <input
          type="text"
          placeholder="Interview Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="comparison-input"
        />
        <textarea
          placeholder="Your Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={4}
          className="comparison-textarea"
        />
        <button onClick={compareAnswer} disabled={loading}>
          {loading ? 'Analyzing...' : 'Compare & Analyze'}
        </button>
      </div>

      {comparison && (
        <div className="comparison-results">
          <div className="scores-container">
            <ScoreRing label="Accuracy" score={comparison.accuracy_score} />
            <ScoreRing label="Completeness" score={comparison.completeness_score} />
            <ScoreRing label="Technical Depth" score={comparison.technical_depth_score} />
            <ScoreRing label="Confidence" score={comparison.confidence_score} />
          </div>
          
          <div className="answer-comparison-view">
            <div className="candidate-answer">
              <h4>Your Answer:</h4>
              <p>{comparison.candidate_answer}</p>
            </div>
            <div className="ideal-answer">
              <h4>Ideal Answer:</h4>
              <p>{comparison.ideal_answer}</p>
            </div>
          </div>
          
          <div className="feedback-card">
            <h4>📈 Personalized Feedback</h4>
            <p>{comparison.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const ScoreRing = ({ label, score }) => (
  <div className="score-ring">
    <div className="ring-value">{Math.round(score || 0)}%</div>
    <div className="ring-label">{label}</div>
  </div>
);

export default AnswerComparison;
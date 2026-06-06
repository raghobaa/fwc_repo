import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function WrittenInterview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, difficulty, questionCount } = location.state || { 
    language: 'React', 
    difficulty: 'Medium', 
    questionCount: 5 
  };
  
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [allSubmitted, setAllSubmitted] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        'http://localhost:5001/api/ai-interview/generate-questions',
        { language, difficulty, questionCount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, value) => {
    setAnswers({ ...answers, [index]: value });
  };

  const evaluateSingleAnswer = async (index) => {
    if (!answers[index] || answers[index].trim().length < 20) {
      alert(`Please provide a detailed answer for question ${index + 1} (at least 20 characters)`);
      return false;
    }
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        'http://localhost:5001/api/ai-interview/evaluate-answer',
        {
          question: questions[index].text,
          answer: answers[index],
          language,
          difficulty
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setEvaluations({ ...evaluations, [index]: response.data });
      return true;
    } catch (error) {
      console.error('Error evaluating answer:', error);
      alert('Failed to evaluate answer. Please try again.');
      return false;
    }
  };

  const submitAllAnswers = async () => {
    setSubmitting(true);
    
    // Evaluate all unanswered questions
    for (let i = 0; i < questions.length; i++) {
      if (!evaluations[i] && answers[i]) {
        await evaluateSingleAnswer(i);
      }
    }
    
    // Prepare answers for report
    const evaluatedAnswers = questions.map((q, i) => ({
      question: q.text,
      answer: answers[i] || '',
      score: evaluations[i]?.score || 70,
      feedback: evaluations[i]?.feedback || "Answer recorded",
      strengths: evaluations[i]?.strengths || ["Question attempted"],
      weaknesses: evaluations[i]?.weaknesses || ["Could be more detailed"]
    }));
    
    try {
      const token = localStorage.getItem("token");
      
      const reportResponse = await axios.post(
        'http://localhost:5001/api/ai-interview/generate-report',
        { answers: evaluatedAnswers, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const finalReport = reportResponse.data;
      setReport(finalReport);
      
      await axios.post(
        'http://localhost:5001/api/ai-interview/save',
        {
          type: 'written',
          language,
          difficulty,
          questionCount,
          questions: evaluatedAnswers,
          overallScore: finalReport.overallScore,
          strengths: finalReport.strengths,
          weaknesses: finalReport.weaknesses,
          recommendations: finalReport.recommendations
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAllSubmitted(true);
    } catch (error) {
      console.error('Error submitting answers:', error);
      alert('Failed to submit answers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (allSubmitted && report) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center mb-8">Written Interview Report</h1>
            
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-green-600 mb-2">{report.overallScore}%</div>
              <p className="text-gray-600">Overall Score</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-green-800 mb-2">✅ Strengths</h3>
                <ul className="space-y-1">
                  {report.strengths?.map((s, i) => <li key={i} className="text-green-700">• {s}</li>)}
                </ul>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-bold text-orange-800 mb-2">⚠️ Areas to Improve</h3>
                <ul className="space-y-1">
                  {report.weaknesses?.map((w, i) => <li key={i} className="text-orange-700">• {w}</li>)}
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-8">
              <h3 className="font-bold text-blue-800 mb-2">📚 Recommendations</h3>
              <ul className="space-y-1">
                {report.recommendations?.map((r, i) => <li key={i} className="text-blue-700">• {r}</li>)}
              </ul>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/skill-tracker')}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Start New Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Written Interview</h1>
          <p className="text-gray-600">Language: {language} | Difficulty: {difficulty} | Questions: {questionCount}</p>
          <p className="text-sm text-gray-500 mt-2">Answer each question in detail. Click "Get Feedback" after each answer.</p>
        </div>
        
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={index} className="bg-white rounded-lg shadow border p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Question {index + 1}
                </h3>
                {evaluations[index] && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    evaluations[index].score >= 80 ? 'bg-green-100 text-green-700' :
                    evaluations[index].score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    Score: {evaluations[index].score}/100
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 mb-4">{question.text}</p>
              
              <textarea
                value={answers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                rows="5"
                placeholder="Type your detailed answer here..."
                className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!evaluations[index] || submitting}
              />
              
              {!evaluations[index] ? (
                <button
                  onClick={() => evaluateSingleAnswer(index)}
                  disabled={!answers[index] || answers[index].trim().length < 20 || submitting}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Get Feedback
                </button>
              ) : (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">AI Feedback</h4>
                  <p className="text-blue-800 text-sm mb-2">{evaluations[index].feedback}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-semibold text-green-700">Strengths:</span>
                      <ul className="list-disc list-inside text-green-600">
                        {evaluations[index].strengths?.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-orange-700">Improve:</span>
                      <ul className="list-disc list-inside text-orange-600">
                        {evaluations[index].weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-8">
          <button
            onClick={submitAllAnswers}
            disabled={submitting}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Generating Final Report...' : 'Submit All & Get Final Report'}
          </button>
          {Object.keys(evaluations).length !== questions.length && Object.keys(answers).length > 0 && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Get feedback for all questions before submitting
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
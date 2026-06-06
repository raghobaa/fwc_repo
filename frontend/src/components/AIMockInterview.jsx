import React, { useState } from 'react';
import axios from 'axios';

export default function AIMockInterview() {
  const [selectedLanguage, setSelectedLanguage] = useState('Python');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([
    {
      text: "Explain the difference between abstract class and interface in Java 8+. When would you choose one over the other?",
      difficulty: "Medium"
    },
    {
      text: "What are Java memory model and garbage collection? Explain the difference between Young Gen and Old Gen in the JVM heap.",
      difficulty: "Hard"
    },
    {
      text: "What is the difference between HashSet and ConcurrentHashMap in Java? When would you use each?",
      difficulty: "Easy"
    }
  ]);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const languages = ['Python', 'JavaScript', 'SQL', 'Java'];

  const handleGenerateNewQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5002/api/interview/generate', {
        language: selectedLanguage
      });
      setQuestions(response.data.questions);
      setCurrentQuestion(0);
      setFeedback(null);
      setUserAnswer('');
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5002/api/interview/feedback', {
        question: questions[currentQuestion].text,
        answer: userAnswer,
        language: selectedLanguage
      });
      setFeedback(response.data.feedback);
    } catch (error) {
      console.error('Error getting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setUserAnswer('');
      setFeedback(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">AI MOCK INTERVIEW</h2>
      
      {/* Language Selection */}
      <div className="flex gap-3 mb-6">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedLanguage === lang
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Question Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-500">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            questions[currentQuestion]?.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
            questions[currentQuestion]?.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {questions[currentQuestion]?.difficulty}
          </span>
        </div>
        <p className="text-gray-900 text-lg leading-relaxed">
          {questions[currentQuestion]?.text}
        </p>
      </div>

      {/* Answer Section */}
      {!feedback ? (
        <div className="space-y-4">
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            rows="6"
            placeholder="Type your answer here..."
            className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex gap-3">
            <button
              onClick={handleSubmitAnswer}
              disabled={loading || !userAnswer.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Submit Answer'}
            </button>
            <button
              onClick={handleGenerateNewQuestions}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              New Questions
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">AI Feedback</h3>
            <p className="text-blue-800 leading-relaxed">{feedback}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleNextQuestion}
              disabled={currentQuestion === questions.length - 1}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Question
            </button>
            <button
              onClick={() => {
                setFeedback(null);
                setUserAnswer('');
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
        <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition-all duration-200">
          Start interview session
        </button>
        <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-all duration-200">
          View AI feedback
        </button>
      </div>
    </div>
  );
}
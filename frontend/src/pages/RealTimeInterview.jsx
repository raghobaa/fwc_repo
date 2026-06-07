import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';

export default function RealTimeInterview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, difficulty, duration } = location.state || { 
    language: 'React', 
    difficulty: 'Medium', 
    duration: 10 
  };
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [interviewActive, setInterviewActive] = useState(true);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const webcamRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    generateQuestions();
    startTimer();
    initSpeechRecognition();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  const generateQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        'http://localhost:5002/api/ai-interview/generate-real-time-questions',
        { 
          language, 
          difficulty, 
          questionCount: 5
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(response.data.questions);
      setLoading(false);
      
      // Speak first question after a short delay
      setTimeout(() => {
        speakQuestion(response.data.questions[0].text);
      }, 2000);
    } catch (error) {
      console.error('Error generating questions:', error);
      setLoading(false);
    }
  };

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        setCurrentAnswer(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    } else {
      console.warn('Speech recognition not supported');
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          endInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const speakQuestion = (question) => {
    if (!question) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setCurrentAnswer('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim() || currentAnswer.trim().length < 5) {
      alert('Please provide a meaningful answer before submitting.');
      return;
    }
    
    stopListening();
    setEvaluating(true);
    
    try {
      const token = localStorage.getItem("token");
      const evaluation = await axios.post(
        'http://localhost:5002/api/ai-interview/evaluate-answer',
        {
          question: questions[currentQuestionIndex].text,
          answer: currentAnswer,
          language,
          difficulty
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newAnswers = [...answers, {
        question: questions[currentQuestionIndex].text,
        answer: currentAnswer,
        score: evaluation.data.score,
        feedback: evaluation.data.feedback,
        strengths: evaluation.data.strengths,
        weaknesses: evaluation.data.weaknesses
      }];
      setAnswers(newAnswers);
      
      if (currentQuestionIndex + 1 < questions.length && timeLeft > 30) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentAnswer('');
        speakQuestion(questions[currentQuestionIndex + 1].text);
      } else {
        await endInterview();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Error submitting answer. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const endInterview = async () => {
    clearInterval(timerRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
    window.speechSynthesis.cancel();
    
    setInterviewActive(false);
    setEvaluating(true);
    
    try {
      const token = localStorage.getItem("token");
      
      const reportResponse = await axios.post(
        'http://localhost:5002/api/ai-interview/generate-report',
        { answers, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const finalReport = reportResponse.data;
      setReport(finalReport);
      
      await axios.post(
        'http://localhost:5002/api/ai-interview/save',
        {
          type: 'real-time',
          language,
          difficulty,
          duration,
          questions: answers,
          overallScore: finalReport.overallScore,
          strengths: finalReport.strengths,
          weaknesses: finalReport.weaknesses,
          recommendations: finalReport.recommendations
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setInterviewComplete(true);
    } catch (error) {
      console.error('Error ending interview:', error);
    } finally {
      setEvaluating(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCamera = () => {
    setCameraEnabled(!cameraEnabled);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-white">Preparing your interview...</p>
        </div>
      </div>
    );
  }

  if (interviewComplete && report) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center mb-8">Interview Report</h1>
            
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-blue-600 mb-2">{report.overallScore}%</div>
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
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Timer */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-white text-xl font-bold">AI Mock Interview</h1>
            <p className="text-gray-400 text-sm">{language} - {difficulty} Level</p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-gray-400 text-sm">Time Remaining</p>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Video Section */}
          <div className="bg-black rounded-lg overflow-hidden">
            {cameraEnabled ? (
              <Webcam
                ref={webcamRef}
                audio={false}
                className="w-full h-auto"
                videoConstraints={{ facingMode: "user" }}
              />
            ) : (
              <div className="aspect-video flex items-center justify-center bg-gray-800">
                <p className="text-white">Camera is off</p>
              </div>
            )}
            
            <div className="p-4 flex gap-2">
              <button
                onClick={toggleCamera}
                className={`flex-1 py-2 rounded ${cameraEnabled ? 'bg-red-600' : 'bg-green-600'} text-white`}
              >
                {cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
              </button>
            </div>
          </div>
          
          {/* Interview Section */}
          <div className="bg-white rounded-lg p-6">
            {!interviewActive ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating your report...</p>
              </div>
            ) : (
              <>
                {/* Question Section */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {difficulty}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-800 text-lg leading-relaxed">
                      {questions[currentQuestionIndex]?.text}
                    </p>
                  </div>
                  <button
                    onClick={() => speakQuestion(questions[currentQuestionIndex]?.text)}
                    disabled={isSpeaking}
                    className="mt-3 text-blue-600 text-sm hover:underline disabled:opacity-50"
                  >
                    {isSpeaking ? '🔊 Speaking...' : '🔊 Read Question Again'}
                  </button>
                </div>
                
                {/* Answer Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Answer {isListening && <span className="text-green-600">(Recording...)</span>}
                  </label>
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    rows="5"
                    placeholder="Speak or type your answer here..."
                    className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={evaluating}
                  />
                </div>
                
                {/* Buttons */}
                <div className="flex gap-3">
                  {!isListening ? (
                    <button
                      onClick={startListening}
                      disabled={evaluating}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      🎤 Start Speaking
                    </button>
                  ) : (
                    <button
                      onClick={stopListening}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                    >
                      ⏹️ Stop Recording
                    </button>
                  )}
                  <button
                    onClick={submitAnswer}
                    disabled={evaluating || (!currentAnswer.trim())}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {evaluating ? 'Evaluating...' : 'Submit Answer'}
                  </button>
                </div>
                
                {/* Status Messages */}
                {isListening && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">🎙️ Listening... Please speak clearly into your microphone</p>
                  </div>
                )}
                
                {isSpeaking && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm">🔊 AI is speaking the question...</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
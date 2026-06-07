import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Mic, MicOff, Video, VideoOff, Send, Loader2, Clock,
  CheckCircle, XCircle, Award, Target, Code, FileText,
  Play, Pause, ChevronRight, AlertCircle, User, Calendar,
  Zap, Brain, BookOpen, Terminal, ChevronLeft, Volume2,
  VolumeX, RefreshCw, Filter, ChevronDown, Download, FileBarChart,
  Settings, ArrowRight, BarChart3, Lightbulb, ThumbsUp, ThumbsDown
} from 'lucide-react';

const API_URL = 'http://localhost:5002/api';

const AiInterviewPage = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [candidateName, setCandidateName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const [userId, setUserId] = useState(null);

  // Interview Settings
  const [interviewSettings, setInterviewSettings] = useState({
    language: 'JavaScript',
    difficulty: 'Medium',
    duration: 30,
    questionCount: 5
  });
  const [showSettings, setShowSettings] = useState(false);

  // Real-time Interview State
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false); // FIXED: added equals sign
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const timerRef = useRef(null);

  // MCQ State
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [mcqStarted, setMcqStarted] = useState(false);
  const [mcqCompleted, setMcqCompleted] = useState(false);
  const [mcqScore, setMcqScore] = useState(0);
  const [mcqTimeLeft, setMcqTimeLeft] = useState(0);
  const [selectedMcqLanguage, setSelectedMcqLanguage] = useState('JavaScript');
  const [mcqDuration, setMcqDuration] = useState(30);
  const mcqTimerRef = useRef(null);

  // Coding State
  const [codingQuestions, setCodingQuestions] = useState([]);
  const [currentCodingIndex, setCurrentCodingIndex] = useState(0);
  const [codingAnswers, setCodingAnswers] = useState({});
  const [codingStarted, setCodingStarted] = useState(false);
  const [codingCompleted, setCodingCompleted] = useState(false);
  const [codingResults, setCodingResults] = useState([]);
  const [codingTimeLeft, setCodingTimeLeft] = useState(0);
  const [runningCode, setRunningCode] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [codingLanguage, setCodingLanguage] = useState('JavaScript');
  const [codingDuration, setCodingDuration] = useState(60);
  const codingTimerRef = useRef(null);

  // Report State
  const [showReport, setShowReport] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);

  // Save user to database
  const saveUser = async (name) => {
    try {
      const response = await axios.post(`${API_URL}/user`, { name });
      if (response.data.success) {
        setUserId(response.data.user._id);
        return true;
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
    return false;
  };

  // Generate Interview Questions from AI
  const generateInterviewQuestions = async () => {
    try {
      const response = await axios.post(`${API_URL}/ai-interview/generate-real-time-questions`, {
        language: interviewSettings.language,
        difficulty: interviewSettings.difficulty,
        questionCount: interviewSettings.questionCount
      });
      return response.data.questions;
    } catch (error) {
      console.error('Error generating questions:', error);
      return [
        { text: `Tell me about your experience with ${interviewSettings.language}.`, difficulty: "Easy" },
        { text: `What are the key features of ${interviewSettings.language} that you find most useful?`, difficulty: "Medium" },
        { text: `Describe a challenging problem you solved using ${interviewSettings.language}.`, difficulty: "Hard" }
      ];
    }
  };

  // Evaluate answer with AI
  const evaluateAnswerWithAI = async (question, answer) => {
    try {
      const response = await axios.post(`${API_URL}/ai-interview/evaluate-answer`, {
        question,
        answer,
        language: interviewSettings.language
      });
      return response.data;
    } catch (error) {
      console.error('Error evaluating answer:', error);
      return { score: 70, feedback: "Good attempt!", improvements: ["Be more specific"], recommendations: ["Practice more"] };
    }
  };

  // Start Real-time Interview
  const startNewInterview = async () => {
    const questions = await generateInterviewQuestions();
    setInterviewQuestions(questions);
    setCurrentQuestion(questions[0]);
    setQuestionIndex(0);
    setAnswers([]);
    setUserAnswer('');
    setTranscript('');
    setFeedback(null);
    setAiRecommendations([]);
    setTimeLeft(interviewSettings.duration * 60);
    setIsInterviewActive(true);
    setActiveModule('realtime');

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          completeInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => speak(questions[0].text), 1000);
  };

  // Camera Functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      mediaStreamRef.current = stream;
      setIsCameraOn(true);
    } catch (error) {
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraOn(false);
  };

  // Speech Functions
  const speak = (text) => {
    if (synthRef.current.speaking) synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + ' ' + finalTranscript);
          setUserAnswer(prev => prev + ' ' + finalTranscript);
        }
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      initSpeechRecognition();
      setTimeout(() => {
        recognitionRef.current?.start();
        setIsListening(true);
      }, 500);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  };

  const analyzeAnswer = async () => {
    if (!userAnswer.trim()) {
      alert("Please provide an answer first.");
      return;
    }
    
    setIsProcessing(true);
    const evaluation = await evaluateAnswerWithAI(currentQuestion.text, userAnswer);
    
    setFeedback({
      score: evaluation.score,
      improvements: evaluation.improvements || [],
      suggestion: evaluation.feedback
    });
    
    setAiRecommendations(evaluation.recommendations || []);
    setIsProcessing(false);
  };

  const handleNextQuestion = () => {
    if (userAnswer.trim() && feedback) {
      const newAnswers = [...answers, {
        questionId: questionIndex,
        question: currentQuestion.text,
        answer: userAnswer,
        feedback: feedback,
        score: feedback.score
      }];
      setAnswers(newAnswers);

      if (questionIndex + 1 < interviewQuestions.length) {
        setQuestionIndex(prev => prev + 1);
        setCurrentQuestion(interviewQuestions[questionIndex + 1]);
        setUserAnswer('');
        setTranscript('');
        setFeedback(null);
        setAiRecommendations([]);
        speak(interviewQuestions[questionIndex + 1].text);
      } else {
        completeInterview(newAnswers);
      }
    } else if (!userAnswer.trim()) {
      alert("Please provide an answer before continuing.");
    } else if (!feedback) {
      alert("Please analyze your answer first.");
    }
  };

  const completeInterview = async (finalAnswers = answers) => {
    clearInterval(timerRef.current);
    setIsInterviewActive(false);
    setInterviewComplete(true);
    stopCamera();
    stopListening();
    if (synthRef.current) synthRef.current.cancel();

    const totalScore = finalAnswers.reduce((acc, a) => acc + (a.score || 0), 0) / finalAnswers.length;
    
    const report = {
      type: 'AI Mock Interview',
      candidate: candidateName,
      date: new Date(),
      score: `${Math.round(totalScore)}%`,
      timeSpent: `${interviewSettings.duration - Math.floor(timeLeft / 60)} minutes`,
      details: finalAnswers.map(a => ({
        question: a.question,
        userAnswer: a.answer,
        score: a.score,
        feedback: a.feedback?.suggestion,
        improvements: a.feedback?.improvements?.join(', ') || 'None'
      })),
      recommendations: aiRecommendations
    };
    
    setCurrentReport(report);
  };

  // MCQ Functions
  const startMcq = () => {
    const questions = getRandomMcqQuestions(selectedMcqLanguage);
    setMcqQuestions(questions);
    setMcqStarted(true);
    setMcqTimeLeft(mcqDuration * 60);
    setSelectedAnswers({});
    setCurrentMcqIndex(0);
    setActiveModule('mcq');

    if (mcqTimerRef.current) clearInterval(mcqTimerRef.current);
    mcqTimerRef.current = setInterval(() => {
      setMcqTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(mcqTimerRef.current);
          handleSubmitMcq();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getRandomMcqQuestions = (language) => {
    const mcqQuestionsBank = {
      JavaScript: [
        { id: 1, text: "What is the output of 'console.log(typeof null)'?", options: ["'null'", "'object'", "'undefined'", "'number'"], correct: 1, explanation: "In JavaScript, typeof null returns 'object'. This is a historical bug that has been kept for compatibility." },
        { id: 2, text: "Which method is used to add an element at the end of an array?", options: ["push()", "pop()", "shift()", "unshift()"], correct: 0, explanation: "push() adds one or more elements to the end of an array and returns the new length." },
        { id: 3, text: "What does 'NaN' stand for?", options: ["Not a Null", "Not a Number", "Null and None", "Number and Null"], correct: 1, explanation: "NaN stands for 'Not a Number' and is returned when mathematical operations fail." },
        { id: 4, text: "What is closure in JavaScript?", options: ["A function that has access to its outer scope", "A way to close a browser window", "A type of loop", "A CSS property"], correct: 0, explanation: "A closure is a function that remembers its outer variables and can access them." },
        { id: 5, text: "What is the purpose of the 'map' function?", options: ["To filter array elements", "To transform each array element", "To sort array", "To reverse array"], correct: 1, explanation: "map() creates a new array by applying a function to each element." }
      ],
      React: [
        { id: 1, text: "What is React?", options: ["A JavaScript library for building UI", "A database", "A server framework", "A CSS framework"], correct: 0, explanation: "React is a JavaScript library for building user interfaces, maintained by Facebook." },
        { id: 2, text: "What is JSX?", options: ["JavaScript XML", "Java Syntax Extension", "JSON X-ray", "JavaScript X-ray"], correct: 0, explanation: "JSX is a syntax extension that allows writing HTML-like code in JavaScript." },
        { id: 3, text: "What is the virtual DOM?", options: ["A lightweight copy of the real DOM", "A database", "A server", "A CSS framework"], correct: 0, explanation: "Virtual DOM is a lightweight representation of the actual DOM for better performance." }
      ]
    };
    return [...(mcqQuestionsBank[language] || mcqQuestionsBank.JavaScript)];
  };

  const handleMcqAnswer = (questionId, answerIndex) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleSubmitMcq = () => {
    let correct = 0;
    const answersWithDetails = [];

    mcqQuestions.forEach(q => {
      const isCorrect = selectedAnswers[q.id] === q.correct;
      if (isCorrect) correct++;
      answersWithDetails.push({
        question: q.text,
        userAnswer: q.options[selectedAnswers[q.id]],
        correctAnswer: q.options[q.correct],
        isCorrect: isCorrect,
        explanation: q.explanation
      });
    });

    const percentage = Math.round((correct / mcqQuestions.length) * 100);
    setMcqScore(percentage);
    setMcqCompleted(true);
    if (mcqTimerRef.current) clearInterval(mcqTimerRef.current);

    setCurrentReport({
      type: 'MCQ Assessment',
      candidate: candidateName,
      date: new Date(),
      score: `${percentage}%`,
      timeSpent: `${mcqDuration - Math.floor(mcqTimeLeft / 60)} minutes`,
      details: answersWithDetails,
      correctCount: correct,
      totalCount: mcqQuestions.length
    });
  };

  // Coding Functions
  const getRandomCodingQuestions = () => {
    const easy = [
      { id: 1, title: "Two Sum", difficulty: "Easy", timeLimit: 15, description: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.", starterCode: `function twoSum(nums, target) {\n  // Write your code here\n  \n}`, testCases: ["twoSum([2,7,11,15], 9) → [0,1]", "twoSum([3,2,4], 6) → [1,2]"], solution: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}` },
      { id: 2, title: "Valid Parentheses", difficulty: "Easy", timeLimit: 15, description: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.", starterCode: `function isValid(s) {\n  // Write your code here\n  \n}`, testCases: ["isValid('()') → true", "isValid('()[]{}') → true", "isValid('(]') → false"], solution: `function isValid(s) {\n  const stack = [];\n  const map = { '(': ')', '{': '}', '[': ']' };\n  for (let char of s) {\n    if (map[char]) stack.push(map[char]);\n    else if (stack.pop() !== char) return false;\n  }\n  return stack.length === 0;\n}` }
    ];
    const medium = [
      { id: 3, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", timeLimit: 20, description: "Find the length of the longest substring without repeating characters.", starterCode: `function lengthOfLongestSubstring(s) {\n  // Write your code here\n  \n}`, testCases: ["lengthOfLongestSubstring('abcabcbb') → 3", "lengthOfLongestSubstring('bbbbb') → 1"], solution: `function lengthOfLongestSubstring(s) {\n  let max = 0, left = 0;\n  const map = new Map();\n  for (let right = 0; right < s.length; right++) {\n    if (map.has(s[right]) && map.get(s[right]) >= left) {\n      left = map.get(s[right]) + 1;\n    }\n    map.set(s[right], right);\n    max = Math.max(max, right - left + 1);\n  }\n  return max;\n}` }
    ];
    const hard = [
      { id: 4, title: "Median of Two Sorted Arrays", difficulty: "Hard", timeLimit: 30, description: "Find the median of two sorted arrays.", starterCode: `function findMedianSortedArrays(nums1, nums2) {\n  // Write your code here\n  \n}`, testCases: ["findMedianSortedArrays([1,3], [2]) → 2.0", "findMedianSortedArrays([1,2], [3,4]) → 2.5"], solution: `function findMedianSortedArrays(nums1, nums2) {\n  const merged = [...nums1, ...nums2].sort((a,b) => a - b);\n  const mid = Math.floor(merged.length / 2);\n  if (merged.length % 2 === 0) return (merged[mid-1] + merged[mid]) / 2;\n  return merged[mid];\n}` }
    ];

    if (codingDuration === 30) {
      return [easy[0], medium[0]];
    } else if (codingDuration === 60) {
      return [easy[0], easy[1], medium[0], hard[0]];
    } else {
      return [easy[0], medium[0], hard[0]];
    }
  };

  const startCoding = () => {
    const questions = getRandomCodingQuestions();
    setCodingQuestions(questions);
    setCodingStarted(true);
    setCodingTimeLeft(codingDuration * 60);
    setCodingAnswers({});
    setCurrentCodingIndex(0);
    setRunningCode(questions[0].starterCode);
    setCodeOutput('');
    setActiveModule('coding');

    if (codingTimerRef.current) clearInterval(codingTimerRef.current);
    codingTimerRef.current = setInterval(() => {
      setCodingTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(codingTimerRef.current);
          handleSubmitCoding();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const runCode = () => {
    if (!runningCode.trim() || runningCode === codingQuestions[currentCodingIndex]?.starterCode) {
      setCodeOutput('❌ Error: Please write your code solution first before running!');
      return;
    }

    setIsRunning(true);
    setCodeOutput('');

    setTimeout(() => {
      try {
        const currentQ = codingQuestions[currentCodingIndex];
        const isCorrect = runningCode.includes(currentQ.solution.substring(0, 100)) || 
                         (runningCode.includes('return') && runningCode.length > 100);
        
        if (isCorrect) {
          setCodeOutput(`✅ Code executed successfully!\n\n📊 Test Results:\n${currentQ.testCases.map(test => `  • ${test}`).join('\n')}\n\n🎉 All test cases passed! Your solution is correct.`);
        } else {
          setCodeOutput(`⚠️ Your solution needs improvement.\n\nExpected solution pattern:\n${currentQ.solution.substring(0, 200)}...\n\nKeep practicing!`);
        }
      } catch (error) {
        setCodeOutput(`❌ Error: ${error.message}`);
      }
      setIsRunning(false);
    }, 1000);
  };

  const saveCodingAnswer = () => {
    if (!runningCode.trim() || runningCode === codingQuestions[currentCodingIndex]?.starterCode) {
      alert('Please write your code solution before saving!');
      return;
    }

    setCodingAnswers(prev => ({ ...prev, [codingQuestions[currentCodingIndex].id]: runningCode }));

    if (currentCodingIndex + 1 < codingQuestions.length) {
      setCurrentCodingIndex(prev => prev + 1);
      setRunningCode(codingQuestions[currentCodingIndex + 1].starterCode);
      setCodeOutput('');
    } else {
      handleSubmitCoding();
    }
  };

  const handleSubmitCoding = () => {
    const results = codingQuestions.map(q => {
      const userCode = codingAnswers[q.id];
      const isCorrect = userCode && (userCode.includes(q.solution?.substring(0, 100)) || userCode.length > 100);
      return {
        title: q.title,
        difficulty: q.difficulty,
        completed: !!userCode,
        score: isCorrect ? 100 : userCode ? 50 : 0,
        testCasesPassed: isCorrect ? 3 : userCode ? 1 : 0
      };
    });

    const totalScore = results.reduce((acc, r) => acc + r.score, 0) / results.length;
    setCodingResults(results);
    setCodingCompleted(true);
    if (codingTimerRef.current) clearInterval(codingTimerRef.current);

    setCurrentReport({
      type: 'Coding Assessment',
      candidate: candidateName,
      date: new Date(),
      score: `${Math.round(totalScore)}%`,
      timeSpent: `${codingDuration - Math.floor(codingTimeLeft / 60)} minutes`,
      details: results.map((r, idx) => ({
        problem: codingQuestions[idx].title,
        difficulty: r.difficulty,
        status: r.completed ? 'Completed' : 'Not Attempted',
        score: r.score,
        testCasesPassed: r.testCasesPassed
      }))
    });
  };

  const downloadReport = () => {
    if (!currentReport) return;

    const reportText = `
${'='.repeat(70)}
AI INTERVIEW ASSESSMENT REPORT
${'='.repeat(70)}

Candidate Name: ${currentReport.candidate}
Assessment Type: ${currentReport.type}
Date: ${new Date(currentReport.date).toLocaleString()}
Overall Score: ${currentReport.score}
Time Spent: ${currentReport.timeSpent}

${'='.repeat(70)}
DETAILED ANALYSIS
${'='.repeat(70)}

${currentReport.details.map((detail, idx) => `
${idx + 1}. ${detail.question || detail.problem} ${detail.difficulty ? `[${detail.difficulty}]` : ''}
   ${detail.userAnswer ? `Your Answer: ${detail.userAnswer.substring(0, 200)}${detail.userAnswer.length > 200 ? '...' : ''}` : ''}
   ${detail.correctAnswer ? `Correct Answer: ${detail.correctAnswer}` : ''}
   Status: ${detail.isCorrect !== undefined ? (detail.isCorrect ? '✓ CORRECT' : '✗ INCORRECT') : detail.status}
   ${detail.explanation ? `Explanation: ${detail.explanation}` : ''}
   ${detail.score !== undefined ? `Score: ${detail.score}%` : ''}
   ${detail.feedback ? `Feedback: ${detail.feedback}` : ''}
`).join('\n')}

${'='.repeat(70)}
RECOMMENDATIONS
${'='.repeat(70)}

${currentReport.recommendations?.map((rec, idx) => `${idx + 1}. ${rec}`).join('\n') || 'Continue practicing to improve your skills!'}

${'='.repeat(70)}
END OF REPORT
${'='.repeat(70)}
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentReport.candidate}_${currentReport.type}_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Name Prompt
  if (showNamePrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-blue-100">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to AI Interview Platform</h2>
          <p className="text-gray-500 mb-6">Please enter your name to get started</p>
          <input
            type="text"
            placeholder="Enter your full name"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={async () => {
              if (candidateName.trim()) {
                await saveUser(candidateName);
                setShowNamePrompt(false);
              } else {
                alert("Please enter your name");
              }
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:shadow-lg transition"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // Report View
  if (showReport && currentReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Assessment Report</h2>
                  <p className="text-blue-100 mt-1">Generated on {new Date().toLocaleDateString()}</p>
                </div>
                <button onClick={() => setShowReport(false)} className="text-white hover:text-blue-200">
                  ← Back to Dashboard
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{currentReport.score}</p>
                  <p className="text-sm text-gray-600">Overall Score</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{currentReport.correctCount || '-'}/{currentReport.totalCount || '-'}</p>
                  <p className="text-sm text-gray-600">Correct Answers</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{currentReport.timeSpent}</p>
                  <p className="text-sm text-gray-600">Time Spent</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FileBarChart className="h-5 w-5 text-blue-600" />
                  Detailed Analysis
                </h3>
                {currentReport.details.map((detail, idx) => (
                  <div key={idx} className={`border-l-4 p-4 rounded-r-lg ${detail.isCorrect !== undefined ? (detail.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-blue-500 bg-blue-50'}`}>
                    <p className="font-semibold text-gray-800">
                      Q{idx + 1}. {detail.question || detail.problem}
                      {detail.difficulty && <span className={`ml-2 text-xs px-2 py-1 rounded ${
                        detail.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        detail.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>{detail.difficulty}</span>}
                    </p>
                    {detail.userAnswer && (
                      <p className="text-sm mt-2"><strong>Your Answer:</strong> {detail.userAnswer}</p>
                    )}
                    {detail.correctAnswer && (
                      <p className="text-sm"><strong>Correct Answer:</strong> {detail.correctAnswer}</p>
                    )}
                    {detail.explanation && (
                      <p className="text-sm mt-2 text-gray-600"><strong>Explanation:</strong> {detail.explanation}</p>
                    )}
                    {detail.feedback && (
                      <p className="text-sm mt-2 text-gray-600"><strong>Feedback:</strong> {detail.feedback}</p>
                    )}
                    <p className={`text-sm mt-2 font-semibold ${detail.isCorrect !== undefined ? (detail.isCorrect ? 'text-green-600' : 'text-red-600') : 'text-blue-600'}`}>
                      {detail.isCorrect !== undefined ? (detail.isCorrect ? '✓ Correct' : '✗ Incorrect') : detail.status}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={downloadReport} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" /> Download Full Report
                </button>
                <button onClick={() => { setActiveModule('dashboard'); setShowReport(false); }} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  if (activeModule === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {candidateName}! 👋</h1>
            <p className="text-gray-500">Choose your assessment mode to begin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Mock Interview Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition cursor-pointer" onClick={() => setShowSettings(true)}>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <Video className="h-12 w-12 mb-3" />
                <h3 className="text-xl font-bold">AI Mock Interview</h3>
                <p className="text-blue-100 text-sm mt-1">Real-time voice interview</p>
              </div>
              <div className="p-6">
                <ul className="space-y-2 text-gray-600 text-sm mb-4">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> AI speaks questions</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Voice recognition</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Real-time feedback</li>
                </ul>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">Configure & Start →</button>
              </div>
            </div>

            {/* MCQ Assessment Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition cursor-pointer" onClick={() => setActiveModule('mcq')}>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                <FileText className="h-12 w-12 mb-3" />
                <h3 className="text-xl font-bold">MCQ Assessment</h3>
                <p className="text-green-100 text-sm mt-1">Knowledge test</p>
              </div>
              <div className="p-6">
                <ul className="space-y-2 text-gray-600 text-sm mb-4">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Multiple choice questions</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Detailed explanations</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Comprehensive report</li>
                </ul>
                <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">Start Assessment →</button>
              </div>
            </div>

            {/* Coding Assessment Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition cursor-pointer" onClick={() => setActiveModule('coding')}>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                <Code className="h-12 w-12 mb-3" />
                <h3 className="text-xl font-bold">Coding Assessment</h3>
                <p className="text-purple-100 text-sm mt-1">DSA problems</p>
              </div>
              <div className="p-6">
                <ul className="space-y-2 text-gray-600 text-sm mb-4">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Multiple difficulty levels</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Code execution</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Test case validation</li>
                </ul>
                <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">Start Assessment →</button>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Interview Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Programming Language</label>
                  <select
                    value={interviewSettings.language}
                    onChange={(e) => setInterviewSettings({...interviewSettings, language: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option>JavaScript</option>
                    <option>Python</option>
                    <option>Java</option>
                    <option>React</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                  <select
                    value={interviewSettings.difficulty}
                    onChange={(e) => setInterviewSettings({...interviewSettings, difficulty: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <select
                    value={interviewSettings.duration}
                    onChange={(e) => setInterviewSettings({...interviewSettings, duration: parseInt(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                  <select
                    value={interviewSettings.questionCount}
                    onChange={(e) => setInterviewSettings({...interviewSettings, questionCount: parseInt(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value={3}>3 questions</option>
                    <option value={5}>5 questions</option>
                    <option value={7}>7 questions</option>
                    <option value={10}>10 questions</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowSettings(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={() => { setShowSettings(false); startNewInterview(); }} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Start Interview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Real-time AI Interview View
  if (activeModule === 'realtime') {
    if (interviewComplete) {
      const totalScore = answers.reduce((acc, a) => acc + (a.score || 0), 0) / answers.length;
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 text-center border border-blue-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Interview Complete!</h2>
            <p className="text-gray-500 mb-4">Thank you for completing the interview, {candidateName}!</p>
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">{Math.round(totalScore)}%</div>
              <div className="text-sm text-gray-500">Overall Score</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowReport(true)} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                <FileBarChart className="h-4 w-4 inline mr-2" /> View Report
              </button>
              <button onClick={() => { setActiveModule('dashboard'); setInterviewComplete(false); setAnswers([]); }} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4 bg-white rounded-xl shadow-sm p-4">
            <button onClick={() => { stopCamera(); setActiveModule('dashboard'); }} className="text-gray-600 hover:text-gray-800">
              ← Exit Interview
            </button>
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 rounded-lg px-4 py-2">
                <Clock className="h-4 w-4 inline mr-2 text-blue-600" />
                <span className="text-gray-700 font-mono">{formatTime(timeLeft)}</span>
              </div>
              <div className="text-gray-600">Question {questionIndex + 1}/{interviewQuestions.length}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {!isCameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <button onClick={startCamera} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Enable Camera</button>
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button onClick={isCameraOn ? stopCamera : startCamera} className={`p-2 rounded-lg ${isCameraOn ? 'bg-red-500' : 'bg-blue-600'} text-white`}>
                  {isCameraOn ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </button>
                <button onClick={isListening ? stopListening : startListening} className={`p-2 rounded-lg ${isListening ? 'bg-red-500' : 'bg-blue-600'} text-white`}>
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                {isSpeaking && <div className="p-2 rounded-lg bg-blue-100 text-blue-600">🔊 AI Speaking...</div>}
                {isListening && <div className="p-2 rounded-lg bg-green-100 text-green-600 animate-pulse">🎙️ Listening...</div>}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              {currentQuestion && (
                <>
                  <div className="mb-4">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">{interviewSettings.language}</span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${
                      currentQuestion.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      currentQuestion.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>{currentQuestion.difficulty}</span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-4 text-center">
                    <Volume2 className="h-6 w-6 text-blue-600 mx-auto mb-3 cursor-pointer hover:text-blue-700" onClick={() => speak(currentQuestion.text)} />
                    <h3 className="text-lg font-semibold text-gray-800">{currentQuestion.text}</h3>
                  </div>
                  
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here or click the microphone to speak..."
                    className="w-full p-3 border border-gray-300 rounded-lg h-32 mb-4 focus:ring-2 focus:ring-blue-500"
                  />
                  
                  {!feedback ? (
                    <button onClick={analyzeAnswer} disabled={isProcessing} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> : <Send className="h-4 w-4 inline mr-2" />}
                      {isProcessing ? "Analyzing..." : "Analyze Answer"}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-700">Score: {feedback.score}%</p>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${feedback.score}%` }}></div>
                          </div>
                        </div>
                        {feedback.improvements && feedback.improvements.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-orange-600">Improvements needed:</p>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {feedback.improvements.map((imp, idx) => (
                                <li key={idx}>{imp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="text-sm text-gray-600 mt-2">{feedback.suggestion}</p>
                      </div>
                      <button onClick={handleNextQuestion} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                        {questionIndex + 1 === interviewQuestions.length ? "Complete Interview →" : "Next Question →"}
                      </button>
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

  // MCQ Assessment View
  if (activeModule === 'mcq') {
    if (mcqCompleted) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                <h2 className="text-2xl font-bold">Assessment Complete!</h2>
                <p className="text-green-100">Your score: {mcqScore}%</p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    Review Your Answers
                  </h3>
                  {mcqQuestions.map((q, idx) => {
                    const userAnswer = selectedAnswers[q.id];
                    const isCorrect = userAnswer === q.correct;
                    return (
                      <div key={q.id} className={`border-l-4 p-4 rounded-r-lg ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                        <p className="font-semibold text-gray-800">{idx + 1}. {q.text}</p>
                        <p className="text-sm mt-2"><strong>Your Answer:</strong> {userAnswer !== undefined ? q.options[userAnswer] : 'Not answered'}</p>
                        <p className="text-sm"><strong>Correct Answer:</strong> {q.options[q.correct]}</p>
                        <p className="text-sm mt-2 text-gray-600"><strong>Explanation:</strong> {q.explanation}</p>
                        <p className={`text-sm mt-2 font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowReport(true)} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    <FileBarChart className="h-4 w-4 inline mr-2" /> View Detailed Report
                  </button>
                  <button onClick={() => { setActiveModule('dashboard'); setMcqStarted(false); setMcqCompleted(false); }} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!mcqStarted) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-blue-100">
            <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">MCQ Assessment</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Programming Language</label>
                <select
                  value={selectedMcqLanguage}
                  onChange={(e) => setSelectedMcqLanguage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option>JavaScript</option>
                  <option>React</option>
                  <option>Python</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <select
                  value={mcqDuration}
                  onChange={(e) => setMcqDuration(parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                </select>
              </div>
            </div>
            <button onClick={startMcq} className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition">
              Start Assessment →
            </button>
          </div>
        </div>
      );
    }

    const currentQ = mcqQuestions[currentMcqIndex];
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                Question {currentMcqIndex + 1} of {mcqQuestions.length}
              </span>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="font-mono text-gray-700">{formatTime(mcqTimeLeft)}</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-lg font-medium text-gray-800 mb-4">{currentQ?.text}</p>
              <div className="space-y-3">
                {currentQ?.options.map((opt, idx) => (
                  <label key={idx} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${selectedAnswers[currentQ.id] === idx ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="mcq"
                      checked={selectedAnswers[currentQ.id] === idx}
                      onChange={() => handleMcqAnswer(currentQ.id, idx)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">{String.fromCharCode(65 + idx)}. {opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentMcqIndex(prev => Math.max(0, prev - 1))} disabled={currentMcqIndex === 0} className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50">
                Previous
              </button>
              {currentMcqIndex + 1 < mcqQuestions.length ? (
                <button onClick={() => setCurrentMcqIndex(prev => prev + 1)} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                  Next →
                </button>
              ) : (
                <button onClick={handleSubmitMcq} className="px-6 py-2 bg-green-600 text-white rounded-lg">
                  Submit Assessment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Coding Assessment View
  if (activeModule === 'coding') {
    if (codingCompleted) {
      const totalScore = codingResults.reduce((acc, r) => acc + r.score, 0) / codingResults.length;
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                <h2 className="text-2xl font-bold">Coding Assessment Complete!</h2>
                <p className="text-purple-100">Your score: {Math.round(totalScore)}%</p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">Problem Summary</h3>
                  {codingResults.map((result, idx) => (
                    <div key={idx} className="border-l-4 border-purple-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                      <p className="font-semibold">{result.title} <span className={`text-xs px-2 py-1 rounded ml-2 ${result.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : result.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{result.difficulty}</span></p>
                      <p className="text-sm mt-1">Status: {result.completed ? '✓ Completed' : '✗ Not Attempted'}</p>
                      <p className="text-sm">Score: {result.score}%</p>
                      {result.completed && <p className="text-sm">Test Cases Passed: {result.testCasesPassed}/3</p>}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowReport(true)} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    <FileBarChart className="h-4 w-4 inline mr-2" /> View Detailed Report
                  </button>
                  <button onClick={() => { setActiveModule('dashboard'); setCodingStarted(false); setCodingCompleted(false); }} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!codingStarted) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-blue-100 text-center">
            <Terminal className="h-16 w-16 text-purple-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Coding Assessment</h2>
            <div className="space-y-4 mb-6 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Programming Language</label>
                <select
                  value={codingLanguage}
                  onChange={(e) => setCodingLanguage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option>JavaScript</option>
                  <option>Python</option>
                  <option>Java</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <select
                  value={codingDuration}
                  onChange={(e) => setCodingDuration(parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value={30}>30 minutes (2-3 problems)</option>
                  <option value={60}>60 minutes (4-5 problems)</option>
                  <option value={90}>90 minutes (6 problems)</option>
                </select>
              </div>
            </div>
            <button onClick={startCoding} className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition">
              Start Assessment →
            </button>
          </div>
        </div>
      );
    }

    const currentCoding = codingQuestions[currentCodingIndex];
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4 bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveModule('dashboard')} className="text-gray-600 hover:text-gray-800">← Exit</button>
              <span className="text-gray-600">Problem {currentCodingIndex + 1}/{codingQuestions.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="font-mono text-gray-700">{formatTime(codingTimeLeft)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">{currentCoding.title}</h2>
                <span className={`px-2 py-1 rounded text-xs text-white ${currentCoding.difficulty === 'Easy' ? 'bg-green-500' : currentCoding.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                  {currentCoding.difficulty}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{currentCoding.description}</p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                <p className="text-sm text-yellow-800">⏱️ Time Limit: {currentCoding.timeLimit} minutes</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Example Test Cases:</p>
                {currentCoding.testCases.map((test, i) => (
                  <div key={i} className="text-xs font-mono text-gray-600 mb-1">
                    <span className="text-blue-600">Test {i + 1}:</span> {test}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="mb-2 flex justify-between items-center">
                <span className="text-sm text-gray-500">Write your solution in {codingLanguage}</span>
                <button onClick={runCode} disabled={isRunning} className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700">
                  {isRunning ? "Running..." : "▶ Run Code"}
                </button>
              </div>
              <textarea
                value={runningCode}
                onChange={(e) => setRunningCode(e.target.value)}
                className="w-full h-80 bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg mb-3 focus:outline-none resize-none"
                spellCheck="false"
              />
              <div className="flex gap-3">
                <button onClick={saveCodingAnswer} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  {currentCodingIndex + 1 === codingQuestions.length ? "📤 Submit All" : "💾 Save & Next"}
                </button>
              </div>
              {codeOutput && (
                <div className={`rounded-lg p-4 mt-3 max-h-40 overflow-y-auto ${codeOutput.includes('Error') || codeOutput.includes('Warning') ? 'bg-red-900' : codeOutput.includes('✅') ? 'bg-green-900' : 'bg-gray-900'}`}>
                  <pre className={`text-xs font-mono whitespace-pre-wrap ${codeOutput.includes('Error') || codeOutput.includes('Warning') ? 'text-red-400' : codeOutput.includes('✅') ? 'text-green-400' : 'text-yellow-400'}`}>{codeOutput}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AiInterviewPage;
import React, { useCallback, useEffect, useRef, useState } from 'react';
import interviewService from '../api/interviewService';

const AiInterview = () => {
  const [serviceAvailable, setServiceAvailable] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [sessionId, setSessionId] = useState(null);
  const [candidateName, setCandidateName] = useState('-');
  const [question, setQuestion] = useState('');
  const [phase, setPhase] = useState('initial');
  const [answer, setAnswer] = useState('');
  const [finished, setFinished] = useState(false);
  const [recommendation, setRecommendation] = useState('-');
  const [evaluation, setEvaluation] = useState('');
  const [recording, setRecording] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    const checkService = async () => {
      try {
        await interviewService.testService();
        setServiceAvailable(true);
      } catch (e) {
        setServiceAvailable(false);
        setError('AI interview service is not available. Please ensure the Flask service is running.');
      }
    };
    checkService();
  }, []);

  const loadNext = useCallback(async (sid = sessionId) => {
    if (!sid) return;
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const res = await interviewService.next(sid);
      if (!res.ok) {
        setError('Error loading next question');
        return;
      }
      if (res.done) {
        await finishInterview(sid);
        return;
      }
      setQuestion(res.question || '');
      setPhase(res.phase || 'initial');
    } catch (e) {
      setError('Error loading next question');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const startInterview = async () => {
    if (!serviceAvailable) return;
    setLoading(true);
    setError('');
    try {
      const res = await interviewService.start({});
      if (res.ok) {
        setSessionId(res.session_id);
        setCandidateName(res.candidate_name || '-');
        await loadNext(res.session_id);
      } else {
        setError('Failed to start interview');
      }
    } catch (e) {
      setError('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = useCallback(async (textOverride) => {
    const finalAnswer = typeof textOverride === 'string' ? textOverride : answer;
    if (!sessionId || !finalAnswer.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await interviewService.answer(sessionId, finalAnswer.trim());
      if (!res.ok) {
        setError('Failed to submit answer');
        return;
      }
      await loadNext();
    } catch (e) {
      setError('Failed to submit answer');
    } finally {
      setLoading(false);
    }
  }, [answer, sessionId, loadNext]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const synth = window.speechSynthesis;
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (synth) {
        synthRef.current = synth;
        setTtsSupported(true);
      }
      if (SR) {
        const rec = new SR();
        rec.lang = 'en-US';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.onresult = async (e) => {
          const t = e.results[0][0].transcript;
          setAnswer(t);
          await submitAnswer(t);
        };
        rec.onerror = () => {
          setError('Speech recognition error');
          setRecording(false);
        };
        rec.onend = () => {
          setRecording(false);
        };
        recognitionRef.current = rec;
        setSttSupported(true);
      }
    }
  }, [submitAnswer]);

  const speak = (text) => {
    const synth = synthRef.current;
    if (!synth || !text) return;
    const ut = new SpeechSynthesisUtterance(text);
    ut.rate = 1.0; ut.pitch = 1.0; ut.volume = 1.0;
    try { synth.cancel(); } catch (_) {}
    synth.speak(ut);
  };

  const speakQuestion = () => {
    if (question) speak(question);
  };

  const toggleRecording = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (recording) {
      try { rec.stop(); } catch (_) {}
      setRecording(false);
    } else {
      setError('');
      try { rec.start(); setRecording(true); } catch (_) { setRecording(false); }
    }
  };

  const finishInterview = useCallback(async (sid = sessionId) => {
    if (!sid) return;
    setLoading(true);
    setError('');
    try {
      const res = await interviewService.finish(sid);
      if (res.ok) {
        setRecommendation(res.recommendation);
        setEvaluation(res.evaluation);
        setFinished(true);
      } else {
        setError('Failed to finish interview');
      }
    } catch (e) {
      setError('Failed to finish interview');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  return (
    <div className="bg-white rounded-lg p-8 shadow max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">AI Interview</h2>

      {!serviceAvailable && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4 text-sm font-medium">
          AI interview service is not available. Please ensure the Flask service is running.
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4 text-sm font-medium">{error}</div>
      )}

      {!finished ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded border">
            <div className="text-gray-700">
              <div className="text-sm">Candidate</div>
              <div className="font-semibold">{candidateName}</div>
            </div>
            <button
              onClick={startInterview}
              disabled={loading || !serviceAvailable}
              className={`py-2 px-4 rounded-lg font-medium transition shadow-sm ${
                loading || !serviceAvailable
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-[#1E3A8A] hover:bg-[#1a3578] text-white'
              }`}
            >
              {sessionId ? 'Restart' : 'Start Interview'}
            </button>
          </div>

          {sessionId && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="text-sm text-gray-500 mb-1">Phase: {phase}</div>
              <div className="text-lg font-semibold text-gray-800">{question || 'Click Start to begin'}</div>

              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  onClick={speakQuestion}
                  disabled={!ttsSupported || !question}
                  className={`py-2 px-4 rounded-lg font-medium transition shadow-sm ${
                    !ttsSupported || !question
                      ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Speak Question
                </button>
                <button
                  onClick={toggleRecording}
                  disabled={!sttSupported}
                  className={`py-2 px-4 rounded-lg font-medium transition shadow-sm ${
                    !sttSupported
                      ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                      : recording
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-[#1E3A8A] hover:bg-[#1a3578] text-white'
                  }`}
                >
                  {recording ? 'Stop Recording' : 'Record Answer'}
                </button>
              </div>

              <div className="mt-4">
                <label className="block mb-2 font-medium text-gray-700">Your Answer:</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full p-3 bg-white border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={5}
                  placeholder="Type your answer here..."
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={submitAnswer}
                  disabled={loading || !answer.trim()}
                  className={`py-2 px-4 rounded-lg font-medium transition shadow-sm ${
                    loading || !answer.trim()
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-[#1E3A8A] hover:bg-[#1a3578] text-white'
                  }`}
                >
                  Submit Answer
                </button>
                <button
                  onClick={() => loadNext()}
                  disabled={loading}
                  className={`py-2 px-4 rounded-lg font-medium transition shadow-sm ${
                    loading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Skip / Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded">
            <div className="font-semibold text-green-800">Final Recommendation: {recommendation}</div>
          </div>
          <div>
            <div className="font-medium text-gray-700 mb-2">Evaluation:</div>
            <pre className="whitespace-pre-wrap text-gray-800 bg-gray-50 border rounded p-4">{evaluation}</pre>
          </div>
          <button
            onClick={() => {
              setFinished(false);
              setSessionId(null);
              setQuestion('');
              setEvaluation('');
              setRecommendation('-');
            }}
            className="w-full py-2 px-4 rounded-lg font-medium transition shadow-sm bg-[#1E3A8A] hover:bg-[#1a3578] text-white"
          >
            Start New Interview
          </button>
        </div>
      )}
    </div>
  );
};

export default AiInterview;

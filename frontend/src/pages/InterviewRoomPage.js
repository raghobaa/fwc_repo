import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import DashboardLayout from '../components/DashboardLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import interviewsService from '../api/interviewsService';

const STUN = [{ urls: 'stun:stun.l.google.com:19302' }];

const RoomInner = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interview, setInterview] = useState(null);
  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState('');
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [fbSummary, setFbSummary] = useState('');
  const [fbRecommendation, setFbRecommendation] = useState('hold');
  const [fbScores, setFbScores] = useState({ technical: '', communication: '', problemSolving: '', cultureFit: '' });

  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const makingOfferRef = useRef(false);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const isHR = useMemo(() => {
    try {
      const role = localStorage.getItem('role');
      return role === 'HR';
    } catch { return false; }
  }, []);
  // Use role to determine polite/impolite; let candidate be polite, HR impolite
  const polite = useMemo(() => !isHR, [isHR]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError('');
      try {
        const iv = await interviewsService.getByRoom(roomId);
        setInterview(iv);

        // media
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // RTCPeerConnection
        const pc = new RTCPeerConnection({ iceServers: STUN });
        pcRef.current = pc;
        const remoteStream = new MediaStream();
        remoteStreamRef.current = remoteStream;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;

        // add local tracks
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        pc.ontrack = (e) => {
          e.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));
        };
        pc.onicecandidate = (e) => {
          if (e.candidate) socketRef.current.emit('signal:candidate', { candidate: e.candidate });
        };
        pc.onnegotiationneeded = async () => {
          try {
            if (!socketRef.current) return;
            if (pcRef.current.signalingState !== 'stable') return;
            makingOfferRef.current = true;
            const offer = await pcRef.current.createOffer();
            await pcRef.current.setLocalDescription(offer);
            socketRef.current.emit('signal:offer', { description: pcRef.current.localDescription });
          } catch (err) {
            // ignore
          } finally {
            makingOfferRef.current = false;
          }
        };

        // Socket.IO
        const token = localStorage.getItem('token');
        const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const s = io(`${BASE}/interview`, {
          auth: { token, roomId },
          transports: ['websocket'],
        });
        socketRef.current = s;

        s.on('connect_error', (err) => setError(`Socket error: ${err.message}`));
        s.on('participant:joined', async () => {
          // Only the existing participant (likely HR) creates an offer, and only when stable
          try {
            if (!pcRef.current) return;
            if (pcRef.current.signalingState !== 'stable') return;
            makingOfferRef.current = true;
            const offer = await pcRef.current.createOffer();
            await pcRef.current.setLocalDescription(offer);
            s.emit('signal:offer', { description: pcRef.current.localDescription });
          } catch (err) {
            // ignore
          } finally {
            makingOfferRef.current = false;
          }
        });
        s.on('signal:offer', async ({ from, description }) => {
          try {
            if (!pcRef.current) return;
            const pc = pcRef.current;
            const offerCollision = makingOfferRef.current || pc.signalingState !== 'stable';
            if (offerCollision) {
              if (!polite) return; // ignore if impolite
              // rollback local description before applying remote offer
              await pc.setLocalDescription({ type: 'rollback' });
            }
            await pc.setRemoteDescription(description);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            s.emit('signal:answer', { description: pc.localDescription });
          } catch (err) {
            // ignore
          }
        });
        s.on('signal:answer', async ({ from, description }) => {
          try {
            if (!pcRef.current) return;
            if (pcRef.current.signalingState !== 'have-local-offer') return;
            await pcRef.current.setRemoteDescription(description);
          } catch (err) {
            // ignore
          }
        });
        s.on('signal:candidate', async ({ from, candidate }) => {
          try { await pcRef.current?.addIceCandidate(candidate); } catch {}
        });
        s.on('chat:message', ({ from, text, ts }) => setChat((c) => [...c, { from, text, ts }]));
        s.on('meeting:ended', () => {
          alert('Meeting ended');
          navigate('/hr/interviews');
        });

        setLoading(false);
      } catch (e) {
        setError('Failed to join room');
        setLoading(false);
      }
    };

    init();

    return () => {
      try { socketRef.current?.disconnect(); } catch {}
      try { pcRef.current?.close(); } catch {}
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [roomId, navigate]);

  const sendMsg = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    socketRef.current.emit('chat:message', { text: msg.trim() });
    setMsg('');
  };

  const toggleMute = () => {
    const tracks = localStreamRef.current?.getAudioTracks() || [];
    tracks.forEach((t) => (t.enabled = !t.enabled));
    setMuted(!muted);
  };
  const toggleCamera = () => {
    const tracks = localStreamRef.current?.getVideoTracks() || [];
    tracks.forEach((t) => (t.enabled = !t.enabled));
    setCameraOff(!cameraOff);
  };
  const startShare = async () => {
    try {
      const ds = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const videoSender = pcRef.current.getSenders().find((s) => s.track && s.track.kind === 'video');
      if (videoSender) await videoSender.replaceTrack(ds.getVideoTracks()[0]);
      setSharing(true);
      ds.getVideoTracks()[0].addEventListener('ended', async () => {
        const camTrack = localStreamRef.current.getVideoTracks()[0];
        if (camTrack && videoSender) await videoSender.replaceTrack(camTrack);
        setSharing(false);
      });
    } catch {}
  };

  const endMeeting = async () => {
    try {
      socketRef.current.emit('meeting:end');
      if (isHR) {
        setShowFeedback(true);
      } else {
        navigate('/hr/interviews');
      }
    } catch {
      navigate('/hr/interviews');
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      if (interview?._id) {
        const scores = {
          technical: fbScores.technical ? Number(fbScores.technical) : undefined,
          communication: fbScores.communication ? Number(fbScores.communication) : undefined,
          problemSolving: fbScores.problemSolving ? Number(fbScores.problemSolving) : undefined,
          cultureFit: fbScores.cultureFit ? Number(fbScores.cultureFit) : undefined,
        };
        await interviewsService.feedback({ interviewId: interview._id, scores, summary: fbSummary, recommendation: fbRecommendation });
        await interviewsService.update(interview._id, { status: 'completed' });
      }
      setShowFeedback(false);
      navigate('/hr/interviews');
    } catch (e) {
      setShowFeedback(false);
      navigate('/hr/interviews');
    }
  };

  return (
    <div className="p-4">
      {loading && <div className="text-gray-700">Connecting…</div>}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-3 text-sm">{error}</div>}
      {interview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Room</div>
              <div className="text-lg font-semibold">{interview.title}</div>
            </div>
            <div className="space-x-2">
              <button onClick={toggleMute} className="px-3 py-1 bg-gray-200 rounded">{muted ? 'Unmute' : 'Mute'}</button>
              <button onClick={toggleCamera} className="px-3 py-1 bg-gray-200 rounded">{cameraOff ? 'Camera On' : 'Camera Off'}</button>
              <button onClick={startShare} disabled={sharing} className={`px-3 py-1 rounded ${sharing ? 'bg-gray-300' : 'bg-gray-200'}`}>Share Screen</button>
              <button onClick={endMeeting} className="px-3 py-1 bg-red-600 text-white rounded">End</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full bg-black rounded h-64" />
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full bg-black rounded h-64" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2"></div>
            <div className="bg-white rounded border p-3">
              <div className="font-semibold mb-2">Chat</div>
              <div className="h-48 overflow-auto border rounded p-2 mb-2 bg-gray-50">
                {chat.map((c, idx) => (
                  <div key={idx} className="text-sm text-gray-800"><span className="text-gray-500 mr-1">[{new Date(c.ts || Date.now()).toLocaleTimeString()}]</span>{c.text}</div>
                ))}
              </div>
              <form onSubmit={sendMsg} className="flex gap-2">
                <input value={msg} onChange={(e)=>setMsg(e.target.value)} className="flex-1 border rounded p-2" placeholder="Type a message" />
                <button className="px-3 py-2 bg-[#1E3A8A] text-white rounded">Send</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white text-gray-800 p-6 rounded-lg w-full max-w-xl">
            <h3 className="text-lg font-bold mb-4">Submit Interview Feedback</h3>
            <form onSubmit={submitFeedback} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm">Technical (0-10)</label>
                  <input type="number" min={0} max={10} value={fbScores.technical} onChange={(e)=>setFbScores({...fbScores, technical:e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Communication (0-10)</label>
                  <input type="number" min={0} max={10} value={fbScores.communication} onChange={(e)=>setFbScores({...fbScores, communication:e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Problem Solving (0-10)</label>
                  <input type="number" min={0} max={10} value={fbScores.problemSolving} onChange={(e)=>setFbScores({...fbScores, problemSolving:e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Culture Fit (0-10)</label>
                  <input type="number" min={0} max={10} value={fbScores.cultureFit} onChange={(e)=>setFbScores({...fbScores, cultureFit:e.target.value})} className="w-full p-2 border rounded" />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm">Recommendation</label>
                <select value={fbRecommendation} onChange={(e)=>setFbRecommendation(e.target.value)} className="w-full p-2 border rounded">
                  <option value="hire">Hire</option>
                  <option value="no_hire">No Hire</option>
                  <option value="hold">Hold</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm">Summary</label>
                <textarea value={fbSummary} onChange={(e)=>setFbSummary(e.target.value)} className="w-full p-2 border rounded" rows={4} placeholder="Feedback summary" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={()=>{setShowFeedback(false); navigate('/hr/interviews');}} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">Cancel</button>
                <button type="submit" className="bg-[#1E3A8A] hover:bg-[#1a3578] text-white px-4 py-2 rounded-lg">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const InterviewRoomPage = () => (
  <DashboardLayout>
    <ErrorBoundary>
      <RoomInner />
    </ErrorBoundary>
  </DashboardLayout>
);

export default InterviewRoomPage;

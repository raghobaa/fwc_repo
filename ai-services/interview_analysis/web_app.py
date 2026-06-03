import os
import json
import time
from datetime import datetime
from typing import List, Dict

from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from dotenv import load_dotenv

from config.gemini_config import model, INTERVIEW_PROMPTS
from tools.parser import read_text_from_file, extract_text_from_pdf
from tools.save_data import save_candidate_data

# Optional MongoDB
try:
    from tools.mongodb_handler import mongodb_handler
    MONGO_AVAILABLE = True
except Exception:
    mongodb_handler = None
    MONGO_AVAILABLE = False

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# In-memory session store (simple for single-user dev use)
SESSIONS: Dict[str, Dict] = {}


def _gemini_generate(prompt: str, retries: int = 3, base_delay: float = 30.0) -> str:
    """Call model.generate_content() with exponential backoff on 429 rate-limit errors."""
    for attempt in range(retries):
        try:
            result = model.generate_content(prompt)
            return (result.text or "").strip()
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "quota" in err_str.lower() or "rate" in err_str.lower():
                if attempt < retries - 1:
                    wait = base_delay * (2 ** attempt)  # 30s, 60s, 120s
                    print(f"[Gemini] Rate limit hit, retrying in {wait:.0f}s... (attempt {attempt + 1}/{retries})")
                    time.sleep(wait)
                else:
                    raise RuntimeError(
                        "Gemini API quota exceeded. Please wait a minute and try again, "
                        "or upgrade your Google AI plan at https://ai.dev/rate-limit"
                    ) from e
            else:
                raise
    return ""


def _extract_candidate_name(resume_text: str) -> str:
    lines = [ln.strip() for ln in resume_text.split('\n') if ln.strip()]
    for line in lines[:10]:
        if 2 < len(line) < 60 and 1 <= len(line.split()) <= 4:
            return line
    return "Candidate"


FIXED_INITIAL_QUESTIONS = [
    "Tell me about yourself?",
    "Languages you know well?",
    "Describe your best project?",
    "How do you debug code?",
    "Why are you interested here?",
]


def _generate_questions_from_jd(job_description: str) -> List[str]:
    """Create 5 questions deterministically from job description lines.
    This avoids out-of-scope questions and keeps UI consistent.
    """
    lines = [ln.strip(" \t-•") for ln in job_description.split("\n") if ln.strip()]
    topics: List[str] = []

    def add_question_from_line(line: str):
        l = line.rstrip('.')
        # Common JD phrasing → targeted question templates
        if l.lower().startswith("experience with"):
            topics.append(f"What is your experience with {l[15:].strip()}?")
        elif any(l.lower().startswith(v) for v in [
            "develop", "work with", "reverse engineer", "debug", "collaborate",
            "analyze", "contribute", "optimize"
        ]):
            topics.append(f"Can you describe your experience: {l}?")
        elif any(kw in l.lower() for kw in ["assembly", "firmware", "bootloader", "drivers", "risc-v", "x86", "arm", "uefi", "gdb", "windbg", "ida pro", "simd", "sse", "avx", "neon"]):
            topics.append(f"Tell me about your experience with {l}.")
        else:
            topics.append(f"How have you handled: {l}?")

    # Prefer responsibilities and technical skills sections
    in_pref = False
    for ln in lines:
        lower = ln.lower()
        if any(h in lower for h in ["key responsibilities", "technical skills", "requirements:", "preferred qualifications"]):
            in_pref = True
            continue
        if in_pref and len(topics) < 5:
            if len(ln) > 8:
                add_question_from_line(ln)
        # Stop after we have enough
        if len(topics) >= 5:
            break

    # If not enough, fall back to any informative lines in the JD
    if len(topics) < 5:
        for ln in lines:
            if len(topics) >= 5:
                break
            if 8 < len(ln) < 160:
                add_question_from_line(ln)

    # Ensure exactly 5 concise questions
    qs = []
    for q in topics[:5]:
        q = q.strip()
        if len(q) > 120:
            q = q[:117] + "..."
        qs.append(q)
    while len(qs) < 5:
        qs.append("Tell me about your work relevant to this role.")
    return qs[:5]


def _extract_stacks_from_jd(job_description: str) -> List[str]:
    """Heuristic extraction of stacks from the JD for fallback guidance.
    Looks for common tech names to seed deep follow-ups.
    """
    lower = job_description.lower()
    candidates = [
        "assembly", "x86", "x86_64", "arm", "risc-v", "firmware", "bootloader",
        "drivers", "uefi", "gdb", "windbg", "ida pro", "simd", "sse", "avx", "neon",
        "docker", "java", "c#", "python", "c", "c++"
    ]
    found = []
    for t in candidates:
        if t in lower:
            found.append(t)
    # Normalize formatting for display in questions
    normalized = [
        t.upper() if t in ["x86", "x86_64", "arm", "risc-v", "sse", "avx", "uefi"] else t.title()
        for t in found
    ]
    # De-duplicate while preserving order
    seen = set()
    stacks = []
    for t in normalized:
        if t not in seen:
            stacks.append(t)
            seen.add(t)
    return stacks


def _generate_deep_followups(job_description: str, responses: List[Dict]) -> List[str]:
    """Use Gemini to generate 5 in-depth technical follow-ups focused on stacks.
    Uses JD content and earlier answers to tailor questions.
    """
    try:
        summary_lines = []
        for i, r in enumerate(responses, 1):
            summary_lines.append(f"Q{i}: {r.get('question','')}")
            summary_lines.append(f"A{i}: {r.get('response','')}")
        prior_summary = "\n".join(summary_lines)

        prompt = f"""
        Based on the job description and the candidate's prior answers, create EXACTLY 5 in-depth technical follow-up questions
        that probe the specific technology stacks required in the role. Focus on technologies explicitly mentioned in the JD
        (languages, tooling, low-level topics) and on areas the candidate seems experienced in from their answers.

        Job Description:\n{job_description}\n\n
        Candidate's prior Q&A:\n{prior_summary}\n\n
        Requirements for output:
        - Provide a simple numbered list (1. .. 5.)
        - Each question must be concise but technically deep
        - Target concrete topics (e.g., Assembly on x86/ARM, SIMD (SSE/AVX/Neon), debugging with GDB/WinDbg, firmware/UEFI, Docker, Java, C/C++, Python) as applicable
        - Do NOT include any explanations, ONLY the questions
        """
        text = _gemini_generate(prompt)
        qs = []
        for line in text.split('\n'):
            s = line.strip()
            if s and s[0].isdigit() and '.' in s:
                q = s.split('.', 1)[1].strip()
                q = q.strip('"\' *')
                if len(q) > 3:
                    qs.append(q)
        if len(qs) >= 5:
            return qs[:5]
    except Exception:
        pass

    # Fallback: craft deep questions from extracted stacks
    stacks = _extract_stacks_from_jd(job_description)[:5]
    if not stacks:
        stacks = ["Assembly", "C", "C++", "Python", "Docker"]
    return [
        f"Explain a complex issue you solved using {stk}. What was your approach?" for stk in stacks
    ][:5]


@app.route("/")
def index():
    # Minimal single-file UI using Web Speech API for TTS/STT
    return render_template_string(
        UI_HTML,
    )


@app.get("/api/interview/test")
def api_test():
    return jsonify({"ok": True, "service": "interview"})


@app.post("/api/start")
@app.post("/api/interview/start")
def api_start():
    data = request.get_json(force=True, silent=True) or {}
    session_id = data.get("session_id") or f"sess_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    # Load assets
    try:
        job_description = read_text_from_file("assets/job_description.txt")
    except Exception:
        job_description = ""

    try:
        resume_text = extract_text_from_pdf("assets/CV-English.pdf")
    except Exception:
        resume_text = ""

    candidate_name = _extract_candidate_name(resume_text) if resume_text else "Interview Candidate"

    # Phase 1: Fixed initial questions
    questions = FIXED_INITIAL_QUESTIONS.copy()

    # Initialize session
    SESSIONS[session_id] = {
        "candidate_name": candidate_name,
        "job_description": job_description,
        "questions": questions,
        "q_index": 0,
        "responses": [],
        "scores": [],
        "started_at": datetime.now().isoformat(),
        "phase": "initial",
        "deep_questions": [],
    }

    return jsonify({
        "ok": True,
        "session_id": session_id,
        "candidate_name": candidate_name,
        "questions": questions,
    })


@app.post("/api/next")
@app.post("/api/interview/next")
def api_next():
    data = request.get_json(force=True)
    session_id = data.get("session_id")
    sess = SESSIONS.get(session_id)
    if not sess:
        return jsonify({"ok": False, "error": "Invalid session"}), 400

    idx = sess["q_index"]
    qs = sess["questions"]
    phase = sess.get("phase", "initial")

    # If finished current phase's questions
    if idx >= len(qs):
        if phase == "initial":
            # Generate deep follow-ups using Gemini and prior answers
            deep_qs = _generate_deep_followups(sess.get("job_description", ""), sess.get("responses", []))
            sess["questions"] = deep_qs
            sess["q_index"] = 0
            sess["phase"] = "deep"

            # Serve first deep question
            if deep_qs:
                return jsonify({"ok": True, "done": False, "index": 0, "question": deep_qs[0], "phase": "deep"})
            else:
                return jsonify({"ok": True, "done": True})
        else:
            return jsonify({"ok": True, "done": True})

    question = qs[idx]
    return jsonify({"ok": True, "done": False, "index": idx, "question": question, "phase": phase})


@app.post("/api/answer")
@app.post("/api/interview/answer")
def api_answer():
    data = request.get_json(force=True)
    session_id = data.get("session_id")
    answer_text = data.get("answer", "").strip()

    sess = SESSIONS.get(session_id)
    if not sess:
        return jsonify({"ok": False, "error": "Invalid session"}), 400

    idx = sess["q_index"]
    if idx >= len(sess["questions"]):
        return jsonify({"ok": False, "error": "Interview already completed"}), 400

    question = sess["questions"][idx]

    # Score with Gemini
    try:
        scoring_prompt = INTERVIEW_PROMPTS["scoring_prompt"].format(
            response=answer_text,
            question=question
        )
        score_text = _gemini_generate(scoring_prompt)
    except Exception as e:
        score_text = f"Scoring error: {e}"

    # naive score extraction (keep compatible with existing logic expectation)
    import re
    numbers = re.findall(r"\b(\d+)\b", score_text)
    scores = {
        "technical_knowledge": 5,
        "communication_skills": 5,
        "problem_solving": 5,
        "experience_relevance": 5,
        "confidence": 5,
    }
    if len(numbers) >= 5:
        scores = {
            "technical_knowledge": min(10, max(0, int(numbers[0]))),
            "communication_skills": min(10, max(0, int(numbers[1]))),
            "problem_solving": min(10, max(0, int(numbers[2]))),
            "experience_relevance": min(10, max(0, int(numbers[3]))),
            "confidence": min(10, max(0, int(numbers[4]))),
        }

    # persist in session
    sess["responses"].append({
        "question": question,
        "response": answer_text,
        "score_text": score_text,
        "scores": scores,
        "timestamp": datetime.now().isoformat(),
    })
    sess["q_index"] += 1

    return jsonify({"ok": True, "scores": scores, "score_text": score_text})


@app.post("/api/finish")
@app.post("/api/interview/finish")
def api_finish():
    data = request.get_json(force=True)
    session_id = data.get("session_id")
    sess = SESSIONS.get(session_id)
    if not sess:
        return jsonify({"ok": False, "error": "Invalid session"}), 400

    # Build interview summary
    summary_lines = [
        f"Interview with {sess['candidate_name']}",
        f"Questions asked: {len(sess['responses'])}",
        "",
    ]
    for i, qa in enumerate(sess["responses"], 1):
        summary_lines.append(f"Q{i}: {qa['question']}")
        summary_lines.append(f"A{i}: {qa['response']}")
        summary_lines.append("")
    interview_summary = "\n".join(summary_lines)

    # Final evaluation via Gemini
    try:
        final_prompt = INTERVIEW_PROMPTS["final_evaluation"].format(
            interview_summary=interview_summary
        )
        evaluation_text = _gemini_generate(final_prompt)
    except Exception as e:
        evaluation_text = f"Evaluation error: {e}"

    # Recommendation extraction
    ev_lower = evaluation_text.lower()
    if "hire" in ev_lower and "no" not in ev_lower:
        recommendation = "HIRE"
    elif "no hire" in ev_lower or "not hire" in ev_lower:
        recommendation = "NO HIRE"
    else:
        recommendation = "MAYBE"

    # Save CSV backup
    save_candidate_data(
        candidate_name=sess["candidate_name"],
        email="N/A",
        phone_number="N/A",
        matching_keywords="Voice Interview (Flask UI)",
        screening_result=recommendation,
    )

    # Save Mongo if available
    if MONGO_AVAILABLE and mongodb_handler:
        overall_score = 0
        if sess["responses"]:
            for r in sess["responses"]:
                s = r.get("scores", {})
                overall_score += sum(s.values())
            overall_score = overall_score / max(1, len(sess["responses"]))

        interview_data = {
            "candidate_name": sess["candidate_name"],
            "interview_type": "voice_interview_web",
            "duration": "N/A",
            "questions_asked": len(sess["responses"]),
            "overall_score": overall_score,
            "final_recommendation": recommendation,
            "detailed_scores": [r.get("scores", {}) for r in sess["responses"]],
            "evaluation_text": evaluation_text,
            "questions": sess["questions"],
            "session_id": session_id,
        }
        try:
            mongodb_handler.save_interview_session(interview_data)
        except Exception:
            pass

    return jsonify({
        "ok": True,
        "evaluation": evaluation_text,
        "recommendation": recommendation,
    })


UI_HTML = r"""
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI Interview (Flask)</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 20px; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    button { padding: 8px 12px; border-radius: 6px; border: 1px solid #ccc; background: #f5f5f5; cursor: pointer; }
    button.primary { background: #2563eb; color: white; border-color: #2563eb; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .muted { color: #666; }
    .q { font-weight: 600; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h2>AI Voice Interview</h2>
  <div class="card">
    <div class="row">
      <button id="startBtn" class="primary">Start Interview</button>
      <span id="status" class="muted"></span>
    </div>
    <div><strong>Candidate:</strong> <span id="candidateName">-</span></div>
  </div>

  <div class="card" id="qaCard" style="display:none;">
    <div class="q" id="question">Question will appear here</div>
    <div class="row" style="margin-top:10px;">
      <button id="speakBtn">🔊 Speak Question</button>
      <button id="recordBtn">🎤 Answer (Hold to speak)</button>
      <button id="nextBtn" class="primary" disabled>Next</button>
    </div>
    <div style="margin-top:10px;">
      <div><strong>Your answer:</strong></div>
      <div id="answerText" class="mono muted">(no answer yet)</div>
    </div>
  </div>

  <div class="card" id="finalCard" style="display:none;">
    <div><strong>Final Recommendation:</strong> <span id="rec">-</span></div>
    <div style="margin-top:10px;">
      <div><strong>Evaluation:</strong></div>
      <div id="evaluation" class="mono"></div>
    </div>
  </div>

<script>
  const synth = window.speechSynthesis;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = SpeechRecognition ? new SpeechRecognition() : null;
  if (recognition) {
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  }

  let sessionId = null;
  let currentQuestion = null;

  const startBtn = document.getElementById('startBtn');
  const statusEl = document.getElementById('status');
  const candidateNameEl = document.getElementById('candidateName');
  const qaCard = document.getElementById('qaCard');
  const questionEl = document.getElementById('question');
  const speakBtn = document.getElementById('speakBtn');
  const recordBtn = document.getElementById('recordBtn');
  const nextBtn = document.getElementById('nextBtn');
  const answerTextEl = document.getElementById('answerText');
  const finalCard = document.getElementById('finalCard');
  const recEl = document.getElementById('rec');
  const evaluationEl = document.getElementById('evaluation');

  function speak(text){
    if (!synth) return;
    const ut = new SpeechSynthesisUtterance(text);
    ut.rate = 1.0; ut.pitch = 1.0; ut.volume = 1.0;
    synth.cancel();
    synth.speak(ut);
  }

  async function startInterview(){
    statusEl.textContent = 'Starting...';
    const res = await fetch('/api/start', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({})});
    const data = await res.json();
    if (!data.ok){ statusEl.textContent = 'Failed to start'; return; }
    sessionId = data.session_id;
    candidateNameEl.textContent = data.candidate_name || '-';
    statusEl.textContent = 'Ready';
    finalCard.style.display = 'none';
    qaCard.style.display = '';
    await loadNextQuestion();
  }

  async function loadNextQuestion(){
    answerTextEl.textContent = '(no answer yet)';
    nextBtn.disabled = true;
    const res = await fetch('/api/next', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({session_id: sessionId})});
    const data = await res.json();
    if (!data.ok){ questionEl.textContent = 'Error loading question'; return; }
    if (data.done){ await finishInterview(); return; }
    currentQuestion = data.question;
    questionEl.textContent = currentQuestion;
  }

  async function sendAnswer(answer){
    const res = await fetch('/api/answer', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({session_id: sessionId, answer})});
    const data = await res.json();
    if (!data.ok){ statusEl.textContent = 'Scoring failed'; return; }
    statusEl.textContent = 'Answer submitted';
    nextBtn.disabled = false;
  }

  async function finishInterview(){
    qaCard.style.display = 'none';
    statusEl.textContent = 'Finalizing...';
    const res = await fetch('/api/finish', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({session_id: sessionId})});
    const data = await res.json();
    if (!data.ok){ statusEl.textContent = 'Finish failed'; return; }
    statusEl.textContent = 'Done';
    recEl.textContent = data.recommendation;
    evaluationEl.textContent = data.evaluation;
    finalCard.style.display = '';
  }

  startBtn.addEventListener('click', startInterview);
  speakBtn.addEventListener('click', ()=>{ if(currentQuestion) speak(currentQuestion); });

  if (recognition){
    let recording = false;
    recordBtn.addEventListener('mousedown', ()=>{
      if (recording) return; recording = true; answerTextEl.textContent = '(listening...)';
      recognition.start();
    });
    recordBtn.addEventListener('mouseup', ()=>{
      if (!recording) return; recognition.stop(); recording = false;
    });

    recognition.addEventListener('result', (e)=>{
      const t = e.results[0][0].transcript;
      answerTextEl.textContent = t;
      sendAnswer(t);
    });
    recognition.addEventListener('error', ()=>{
      answerTextEl.textContent = '(speech recognition error)';
    });
  } else {
    recordBtn.disabled = true;
    recordBtn.textContent = '🎤 Answer (unsupported browser)';
  }

  nextBtn.addEventListener('click', loadNextQuestion);
</script>
</body>
</html>
"""


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5004))
    app.run(host="0.0.0.0", port=port, debug=True)

import { useState, useRef, useEffect } from "react";

const API_BASE = process.env.REACT_APP_RESUME_AI_API_URL || "http://localhost:5009/api";

const SUGGESTED_QUESTIONS = [
  "Find React developers with 3+ years experience",
  "Who has experience with Python and machine learning?",
  "Show me candidates with team lead experience",
  "Find freshers with good communication skills",
];

export default function HRChatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your HR assistant 👋 Ask me anything about the uploaded resumes — I'll find the best matching candidates for you.",
      resumes: []
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, top_k: 5 })
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer,
          resumes: data.matched_resumes || []
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, something went wrong. Please try again.", resumes: [] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerIcon}>🤖</div>
        <div>
          <div style={styles.headerTitle}>HR Resume Assistant</div>
          <div style={styles.headerSub}>Powered by Gemini · Ask about any candidate</div>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} style={{ ...styles.msgRow, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              ...styles.bubble,
              ...(msg.role === "user" ? styles.userBubble : styles.aiBubble)
            }}>
              <div style={styles.bubbleText}>{msg.text}</div>

              {/* Matched resumes */}
              {msg.resumes && msg.resumes.length > 0 && (
                <div style={styles.resumeCards}>
                  <div style={styles.resumeCardsTitle}>📋 Matched Candidates ({msg.resumes.length})</div>
                  {msg.resumes.map((r, j) => (
                    <div key={j} style={styles.resumeCard}>
                      <div style={styles.resumeCardName}>{r.candidate_name || r.filename}</div>
                      {r.score && (
                        <div style={styles.resumeScore}>
                          Match: {(r.score * 100).toFixed(0)}%
                          <div style={styles.scoreBar}>
                            <div style={{ ...styles.scoreBarFill, width: `${r.score * 100}%` }} />
                          </div>
                        </div>
                      )}
                      {r.text_preview && (
                        <div style={styles.resumePreview}>{r.text_preview}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.msgRow, justifyContent: "flex-start" }}>
            <div style={{ ...styles.bubble, ...styles.aiBubble }}>
              <div style={styles.typingDots}>
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div style={styles.suggestions}>
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button key={i} style={styles.suggestionBtn} onClick={() => sendMessage(q)}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={styles.inputRow}>
        <textarea
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about candidates... e.g. 'Find Python developers with Django experience'"
          rows={2}
          disabled={loading}
        />
        <button
          style={{ ...styles.sendBtn, opacity: loading || !input.trim() ? 0.5 : 1 }}
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex", flexDirection: "column", height: "100%",
    fontFamily: "system-ui, sans-serif", background: "#fff"
  },
  header: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "16px 20px", background: "#1e293b", color: "#fff"
  },
  headerIcon: { fontSize: "28px" },
  headerTitle: { fontWeight: 700, fontSize: "16px" },
  headerSub: { fontSize: "12px", color: "#94a3b8" },
  messages: { flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" },
  msgRow: { display: "flex" },
  bubble: { maxWidth: "80%", borderRadius: "12px", padding: "12px 16px" },
  userBubble: { background: "#6366f1", color: "#fff", borderBottomRightRadius: "4px" },
  aiBubble: { background: "#f1f5f9", color: "#1e293b", borderBottomLeftRadius: "4px" },
  bubbleText: { fontSize: "14px", lineHeight: 1.6, whiteSpace: "pre-wrap" },
  resumeCards: { marginTop: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "10px" },
  resumeCardsTitle: { fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "8px" },
  resumeCard: {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px",
    padding: "10px 12px", marginBottom: "8px"
  },
  resumeCardName: { fontWeight: 700, fontSize: "13px", color: "#1e293b", marginBottom: "4px" },
  resumeScore: { fontSize: "12px", color: "#64748b", marginBottom: "6px" },
  scoreBar: { height: "4px", background: "#e2e8f0", borderRadius: "2px", marginTop: "3px" },
  scoreBarFill: { height: "100%", background: "#6366f1", borderRadius: "2px" },
  resumePreview: { fontSize: "12px", color: "#64748b", lineHeight: 1.5 },
  typingDots: { display: "flex", gap: "4px", padding: "4px 0" },
  suggestions: { padding: "0 20px 12px", display: "flex", flexWrap: "wrap", gap: "8px" },
  suggestionBtn: {
    padding: "6px 14px", background: "#f1f5f9", border: "1px solid #e2e8f0",
    borderRadius: "20px", cursor: "pointer", fontSize: "13px", color: "#475569"
  },
  inputRow: {
    display: "flex", gap: "10px", padding: "14px 20px",
    borderTop: "1px solid #e2e8f0", background: "#fff"
  },
  input: {
    flex: 1, padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px",
    fontSize: "14px", resize: "none", fontFamily: "system-ui", outline: "none"
  },
  sendBtn: {
    width: "44px", height: "44px", background: "#6366f1", color: "#fff",
    border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "18px", alignSelf: "flex-end"
  }
};

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../utils/auth";

const SYSTEM_PROMPT = `You are Haven, a compassionate AI mental health support companion for Mind Haven — a peer counselling platform at United States International University-Africa (USIU-Africa).

Your role is to provide emotional support, active listening, and gentle guidance to university students who are experiencing stress, anxiety, low mood, or other emotional challenges — especially when peer counsellors are unavailable.

Guidelines:
- Always respond with warmth, empathy, and patience.
- Use a calm, non-clinical tone. You are a supportive companion, not a therapist.
- Ask one gentle follow-up question at a time to better understand how the student is feeling.
- Offer practical coping suggestions when appropriate (breathing exercises, journaling, grounding techniques).
- If a student expresses thoughts of self-harm or suicide, always encourage them to contact a professional immediately and provide the Befrienders Kenya helpline: 0800 723 253.
- Never diagnose, prescribe, or replace professional mental health care.
- Keep responses concise — 2 to 4 sentences unless the student needs more.
- You can recommend the student books a session with a peer counsellor when they feel ready.
- Always maintain confidentiality and a non-judgmental space.

Start by warmly welcoming the student and asking how they are feeling today.`;

function AIChatBot() {
  const navigate = useNavigate();
  const location = useLocation();

  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [started, setStarted]       = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const navItems = [
    { label: "Dashboard", path: "/dashboard"  },
    { label: "Chat",      path: "/chat"        },
    { label: "Resources", path: "/resources"   },
    { label: "Journal",   path: "/journal"     },
  ];

  const getNow = () =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Start conversation — fetch opening message from AI
  const startChat = async () => {
    setStarted(true);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5000/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: "Hello" }],
        }),
      });
      const data = await response.json();
      const text = data.content?.find((b) => b.type === "text")?.text || "Hello! I'm Haven. How are you feeling today?";
      setMessages([{ role: "assistant", text, time: getNow() }]);
    } catch (err) {
      setError("Unable to connect to Haven right now. Please try again.");
      setStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", text, time: getNow() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setError(null);

    // Build message history for API (exclude time field)
    const apiMessages = updatedMessages.map((m) => ({
      role: m.role,
      content: m.text,
    }));

    try {
      const response = await fetch("http://localhost:5000/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });
      const data = await response.json();
      const reply = data.content?.find((b) => b.type === "text")?.text;
      if (reply) {
        setMessages((prev) => [...prev, { role: "assistant", text: reply, time: getNow() }]);
      } else {
        throw new Error("Empty response");
      }
    } catch (err) {
      setError("Haven couldn't respond. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = () => { logoutUser(); navigate("/login"); };

  return (
    <div style={S.container}>

      {/* Sidebar */}
      <div style={S.sidebar}>
        <h2 style={S.logo}>Mind Haven</h2>
        {navItems.map((item) => (
          <button
            key={item.path}
            style={location.pathname === item.path ? S.navButtonActive : S.navButton}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
        <button style={S.logoutButton} onClick={handleLogout}>Logout</button>
      </div>

      {/* Chat area */}
      <div style={S.chatContainer}>

        {/* Header */}
        <div style={S.chatHeader}>
          <div style={S.headerLeft}>
            <div style={S.havenAvatar}>H</div>
            <div>
              <p style={S.havenName}>Haven <span style={S.aiBadge}>AI</span></p>
              <p style={S.havenSub}>AI support companion · Always available</p>
            </div>
          </div>
          <div style={S.headerRight}>
            <span style={S.onlineBadge}>● Online</span>
            <button style={S.bookSessionBtn} onClick={() => navigate("/chat")}>
              Book a Peer Session
            </button>
          </div>
        </div>

        {/* Messages or landing */}
        {!started ? (
          <div style={S.landing}>
            <div style={S.landingCard}>
              <div style={S.landingAvatar}>H</div>
              <h2 style={S.landingTitle}>Meet Haven</h2>
              <p style={S.landingText}>
                Haven is your AI support companion — available 24/7 when peer counsellors are offline.
                It's a safe, private space to talk through how you're feeling.
              </p>
              <div style={S.landingFeatures}>
                {[
                  "Confidential & judgment-free",
                  "Available any time of day",
                  "Coping tips & emotional support",
                  "Can connect you to a peer counsellor",
                ].map((f) => (
                  <div key={f} style={S.featureRow}>
                    <span style={S.featureTick}>✓</span>
                    <span style={S.featureText}>{f}</span>
                  </div>
                ))}
              </div>
              <p style={S.disclaimer}>
                Haven is an AI and not a replacement for professional mental health care.
                If you are in crisis, please contact Befrienders Kenya: <strong>0800 723 253</strong>.
              </p>
              <button style={S.startBtn} onClick={startChat}>
                Start Chatting with Haven
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={S.messagesArea}>
              {/* Disclaimer pill */}
              <div style={S.disclaimerPill}>
                Haven is an AI. For crisis support call Befrienders Kenya: 0800 723 253
              </div>

              {messages.map((msg, i) => {
                const isUser = msg.role === "user";
                return (
                  <div key={i} style={{ ...S.msgRow, justifyContent: isUser ? "flex-end" : "flex-start" }}>
                    {!isUser && <div style={S.msgAvatar}>H</div>}
                    <div style={{ maxWidth: "70%" }}>
                      <div style={isUser ? S.bubbleUser : S.bubbleHaven}>
                        {msg.text}
                      </div>
                      <p style={{ ...S.timestamp, textAlign: isUser ? "right" : "left" }}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Loading dots */}
              {loading && (
                <div style={{ ...S.msgRow, justifyContent: "flex-start" }}>
                  <div style={S.msgAvatar}>H</div>
                  <div style={S.typingBubble}>
                    <span className="dot1" style={S.dot} />
                    <span className="dot2" style={S.dot} />
                    <span className="dot3" style={S.dot} />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={S.errorMsg}>
                  {error}
                  <button style={S.retryBtn} onClick={() => setError(null)}>Dismiss</button>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={S.inputArea}>
              <textarea
                ref={inputRef}
                style={S.input}
                rows={1}
                placeholder="Share how you're feeling..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button
                style={input.trim() && !loading ? S.sendBtn : S.sendBtnDisabled}
                onClick={sendMessage}
                disabled={!input.trim() || loading}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Typing animation
const styleTag = document.createElement("style");
styleTag.textContent = `
  @keyframes blink {
    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
    40%            { opacity: 1;   transform: scale(1);   }
  }
  .dot1 { animation: blink 1.2s infinite 0s;   }
  .dot2 { animation: blink 1.2s infinite 0.2s; }
  .dot3 { animation: blink 1.2s infinite 0.4s; }
`;
if (!document.head.querySelector("#haven-styles")) {
  styleTag.id = "haven-styles";
  document.head.appendChild(styleTag);
}

const S = {
  container: { display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" },

  // Sidebar
  sidebar:         { width: "240px", backgroundColor: "#111827", color: "white", display: "flex", flexDirection: "column", padding: "25px 20px", gap: "10px", flexShrink: 0 },
  logo:            { fontSize: "20px", marginBottom: "20px" },
  navButton:       { padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "#9ca3af", cursor: "pointer", textAlign: "left", fontSize: "14px" },
  navButtonActive: { padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", textAlign: "left", fontSize: "14px" },
  logoutButton:    { marginTop: "auto", padding: "10px", borderRadius: "8px", border: "1px solid #4b5563", backgroundColor: "transparent", color: "white", cursor: "pointer" },

  // Chat container
  chatContainer: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: "#f3f4f6" },

  // Header
  chatHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", backgroundColor: "white", borderBottom: "1px solid #e5e7eb", flexShrink: 0 },
  headerLeft:  { display: "flex", alignItems: "center", gap: "12px" },
  havenAvatar: { width: "42px", height: "42px", borderRadius: "50%", backgroundColor: "#818cf8", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "18px", flexShrink: 0 },
  havenName:   { margin: "0 0 2px", fontWeight: "600", fontSize: "15px", color: "#111827", display: "flex", alignItems: "center", gap: "8px" },
  aiBadge:     { fontSize: "10px", backgroundColor: "#ede9fe", color: "#6d28d9", padding: "2px 7px", borderRadius: "10px", fontWeight: "600" },
  havenSub:    { margin: 0, fontSize: "12px", color: "#9ca3af" },
  headerRight: { display: "flex", alignItems: "center", gap: "12px" },
  onlineBadge: { fontSize: "12px", color: "#16a34a", backgroundColor: "#dcfce7", padding: "5px 12px", borderRadius: "20px", fontWeight: "500" },
  bookSessionBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid #818cf8", backgroundColor: "white", color: "#818cf8", cursor: "pointer", fontSize: "13px", fontWeight: "500" },

  // Landing screen
  landing:     { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", backgroundColor: "#f3f4f6" },
  landingCard: { backgroundColor: "white", borderRadius: "16px", padding: "40px 36px", maxWidth: "480px", width: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", textAlign: "center" },
  landingAvatar: { width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#818cf8", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "28px", margin: "0 auto 16px" },
  landingTitle:  { margin: "0 0 12px", fontSize: "22px", fontWeight: "bold", color: "#111827" },
  landingText:   { margin: "0 0 24px", fontSize: "14px", color: "#6b7280", lineHeight: 1.7 },
  landingFeatures: { textAlign: "left", marginBottom: "24px" },
  featureRow:    { display: "flex", alignItems: "center", gap: "10px", padding: "6px 0" },
  featureTick:   { color: "#818cf8", fontWeight: "bold", fontSize: "14px", flexShrink: 0 },
  featureText:   { fontSize: "13px", color: "#374151" },
  disclaimer:    { fontSize: "12px", color: "#9ca3af", backgroundColor: "#f9fafb", borderRadius: "8px", padding: "10px 14px", marginBottom: "24px", lineHeight: 1.6, textAlign: "left" },
  startBtn:      { width: "100%", padding: "12px", borderRadius: "10px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "15px", fontWeight: "600" },

  // Messages
  messagesArea:   { flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "4px" },
  disclaimerPill: { alignSelf: "center", backgroundColor: "#fef9c3", color: "#ca8a04", fontSize: "11px", padding: "5px 14px", borderRadius: "20px", marginBottom: "16px", textAlign: "center", maxWidth: "90%", lineHeight: 1.5 },
  msgRow:         { display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "4px" },
  msgAvatar:      { width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#818cf8", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", flexShrink: 0, marginBottom: "18px" },

  bubbleUser:  { backgroundColor: "#818cf8", color: "white", padding: "10px 14px", borderRadius: "18px 18px 4px 18px", fontSize: "14px", lineHeight: 1.6, wordBreak: "break-word" },
  bubbleHaven: { backgroundColor: "white", color: "#111827", padding: "10px 14px", borderRadius: "18px 18px 18px 4px", fontSize: "14px", lineHeight: 1.6, border: "1px solid #f3f4f6", wordBreak: "break-word", whiteSpace: "pre-wrap" },
  timestamp:   { margin: "4px 4px 8px", fontSize: "10px", color: "#9ca3af" },

  typingBubble:{ backgroundColor: "white", border: "1px solid #f3f4f6", padding: "12px 16px", borderRadius: "18px 18px 18px 4px", display: "flex", gap: "5px", alignItems: "center", marginBottom: "22px" },
  dot:         { width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#9ca3af", display: "inline-block" },

  errorMsg:  { alignSelf: "center", backgroundColor: "#fee2e2", color: "#dc2626", fontSize: "12px", padding: "8px 16px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "12px", margin: "8px 0" },
  retryBtn:  { border: "none", background: "none", color: "#dc2626", cursor: "pointer", fontSize: "12px", textDecoration: "underline" },

  // Input
  inputArea:       { padding: "16px 24px", backgroundColor: "white", borderTop: "1px solid #e5e7eb", display: "flex", gap: "12px", alignItems: "flex-end", flexShrink: 0 },
  input:           { flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", resize: "none", fontFamily: "Arial, sans-serif", lineHeight: 1.5 },
  sendBtn:         { padding: "10px 22px", borderRadius: "10px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: "500", flexShrink: 0 },
  sendBtnDisabled: { padding: "10px 22px", borderRadius: "10px", border: "none", backgroundColor: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed", fontSize: "14px", flexShrink: 0 },
};

export default AIChatBot;
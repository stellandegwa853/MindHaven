import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../utils/auth";

function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [messages, setMessages]       = useState([
    { id: 1, sender: "counsellor", text: "Hi there! I'm Faith, your peer counsellor today. How are you feeling?", time: "10:01 AM" },
    { id: 2, sender: "student",    text: "Hi Faith, I've been feeling quite stressed about my upcoming exams.", time: "10:02 AM" },
    { id: 3, sender: "counsellor", text: "I hear you — exam season can be really overwhelming. Can you tell me a bit more about what's been going on?", time: "10:02 AM" },
  ]);
  const [input, setInput]             = useState("");
  const [isTyping, setIsTyping]       = useState(false);
  const [counsellorOnline, setCounsellorOnline] = useState(true);
  const [sessionEnded, setSessionEnded]         = useState(false);
  const [showEndConfirm, setShowEndConfirm]     = useState(false);
  const [sessionDuration, setSessionDuration]   = useState(0);

  const bottomRef    = useRef(null);
  const inputRef     = useRef(null);
  const timerRef     = useRef(null);
  const typingTimer  = useRef(null);
  let msgId          = useRef(4);

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Chat",      path: "/chat"      },
    { label: "Resources", path: "/resources" },
    { label: "Journal",   path: "/journal"   },
  ];

  // Session timer
  useEffect(() => {
    if (!sessionEnded) {
      timerRef.current = setInterval(() => setSessionDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionEnded]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getNow = () =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  // Simulate counsellor reply
  const simulateReply = (userText) => {
    setIsTyping(true);
    const delay = 1500 + Math.random() * 1000;
    typingTimer.current = setTimeout(() => {
      const replies = [
        "That makes a lot of sense. Thank you for sharing that with me.",
        "How long have you been feeling this way?",
        "It sounds like you're carrying a lot right now. You're not alone in this.",
        "Have you tried any coping strategies so far?",
        "That's really understandable. Let's work through this together.",
        "I appreciate you being so open. What would feel most helpful right now?",
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setMessages((prev) => [
        ...prev,
        { id: msgId.current++, sender: "counsellor", text: reply, time: getNow() },
      ]);
      setIsTyping(false);
    }, delay);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text || sessionEnded) return;
    const msg = { id: msgId.current++, sender: "student", text, time: getNow() };
    setMessages((prev) => [...prev, msg]);
    setInput("");
    inputRef.current?.focus();
    simulateReply(text);
    // TODO: POST /api/messages { session_id, text }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const endSession = () => {
    clearInterval(timerRef.current);
    clearTimeout(typingTimer.current);
    setIsTyping(false);
    setSessionEnded(true);
    setShowEndConfirm(false);
    setCounsellorOnline(false);
    setMessages((prev) => [
      ...prev,
      { id: msgId.current++, sender: "system", text: "Session ended. Thank you for reaching out — take care of yourself.", time: getNow() },
    ]);
    // TODO: PATCH /api/sessions/:id { session_status: "completed" }
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

        {/* Chat header */}
        <div style={S.chatHeader}>
          <div style={S.headerLeft}>
            <div style={S.avatar}>FN</div>
            <div>
              <p style={S.counsellorName}>Faith Njeri</p>
              <p style={counsellorOnline ? S.statusOnline : S.statusOffline}>
                <span style={{ ...S.statusDot, backgroundColor: counsellorOnline ? "#16a34a" : "#9ca3af" }} />
                {counsellorOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <div style={S.headerRight}>
            <div style={S.sessionTimer}>
              <span style={S.timerDot} />
              {formatDuration(sessionDuration)}
            </div>
            {!sessionEnded && (
              <button style={S.endBtn} onClick={() => setShowEndConfirm(true)}>
                End Session
              </button>
            )}
            {sessionEnded && (
              <button style={S.backBtn} onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </button>
            )}
          </div>
        </div>

        {/* End session confirm banner */}
        {showEndConfirm && (
          <div style={S.confirmBanner}>
            <p style={S.confirmText}>Are you sure you want to end this session?</p>
            <div style={S.confirmBtns}>
              <button style={S.confirmYes} onClick={endSession}>Yes, end session</button>
              <button style={S.confirmNo}  onClick={() => setShowEndConfirm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div style={S.messagesArea}>

          {/* Session start pill */}
          <div style={S.sessionPill}>Session started · {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>

          {messages.map((msg) => {
            if (msg.sender === "system") {
              return (
                <div key={msg.id} style={S.systemMsg}>
                  <span>{msg.text}</span>
                </div>
              );
            }

            const isStudent = msg.sender === "student";
            return (
              <div key={msg.id} style={{ ...S.msgRow, justifyContent: isStudent ? "flex-end" : "flex-start" }}>
                {!isStudent && <div style={S.msgAvatar}>FN</div>}
                <div style={{ maxWidth: "65%" }}>
                  <div style={isStudent ? S.bubbleStudent : S.bubbleCounsellor}>
                    {msg.text}
                  </div>
                  <p style={{ ...S.timestamp, textAlign: isStudent ? "right" : "left" }}>
                    {msg.time}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div style={{ ...S.msgRow, justifyContent: "flex-start" }}>
              <div style={S.msgAvatar}>FN</div>
              <div style={S.typingBubble}>
                <span style={S.dot1} />
                <span style={S.dot2} />
                <span style={S.dot3} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={S.inputArea}>
          {sessionEnded ? (
            <div style={S.sessionEndedBar}>
              <p style={S.sessionEndedText}>This session has ended. Start a new session from the dashboard.</p>
              <button style={S.newSessionBtn} onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
            </div>
          ) : (
            <>
              <textarea
                ref={inputRef}
                style={S.input}
                rows={1}
                placeholder="Type a message... (Enter to send)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sessionEnded}
              />
              <button
                style={input.trim() ? S.sendBtn : S.sendBtnDisabled}
                onClick={sendMessage}
                disabled={!input.trim() || sessionEnded}
              >
                Send
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

// ── animated typing dots via keyframes injected once ─────────────────────────
const styleTag = document.createElement("style");
styleTag.textContent = `
  @keyframes blink {
    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
    40%            { opacity: 1;   transform: scale(1);   }
  }
  .dot1 { animation: blink 1.2s infinite 0s;    }
  .dot2 { animation: blink 1.2s infinite 0.2s;  }
  .dot3 { animation: blink 1.2s infinite 0.4s;  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  .timer-dot { animation: pulse 1.5s infinite; }
`;
if (!document.head.querySelector("#chat-styles")) {
  styleTag.id = "chat-styles";
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
  chatHeader:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", backgroundColor: "white", borderBottom: "1px solid #e5e7eb", flexShrink: 0 },
  headerLeft:    { display: "flex", alignItems: "center", gap: "12px" },
  avatar:        { width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#ede9fe", color: "#6d28d9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "13px", flexShrink: 0 },
  counsellorName:{ margin: 0, fontWeight: "600", fontSize: "15px", color: "#111827" },
  statusOnline:  { margin: "3px 0 0", fontSize: "12px", color: "#16a34a", display: "flex", alignItems: "center", gap: "5px" },
  statusOffline: { margin: "3px 0 0", fontSize: "12px", color: "#9ca3af", display: "flex", alignItems: "center", gap: "5px" },
  statusDot:     { width: "7px", height: "7px", borderRadius: "50%", display: "inline-block" },
  headerRight:   { display: "flex", alignItems: "center", gap: "12px" },
  sessionTimer:  { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280", backgroundColor: "#f9fafb", padding: "6px 12px", borderRadius: "20px", border: "1px solid #e5e7eb" },
  timerDot:      { width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#ef4444", display: "inline-block" },
  endBtn:        { padding: "8px 16px", borderRadius: "8px", border: "1px solid #dc2626", backgroundColor: "white", color: "#dc2626", cursor: "pointer", fontSize: "13px", fontWeight: "500" },
  backBtn:       { padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "13px" },

  // Confirm banner
  confirmBanner: { backgroundColor: "#fff7f7", borderBottom: "1px solid #fecaca", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  confirmText:   { margin: 0, fontSize: "13px", color: "#dc2626" },
  confirmBtns:   { display: "flex", gap: "8px" },
  confirmYes:    { padding: "6px 14px", borderRadius: "8px", border: "none", backgroundColor: "#dc2626", color: "white", cursor: "pointer", fontSize: "13px" },
  confirmNo:     { padding: "6px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "white", color: "#6b7280", cursor: "pointer", fontSize: "13px" },

  // Messages
  messagesArea:  { flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "4px" },
  sessionPill:   { alignSelf: "center", backgroundColor: "#e5e7eb", color: "#6b7280", fontSize: "11px", padding: "4px 14px", borderRadius: "20px", marginBottom: "16px" },
  systemMsg:     { alignSelf: "center", backgroundColor: "#ede9fe", color: "#6d28d9", fontSize: "12px", padding: "6px 16px", borderRadius: "20px", margin: "12px 0", textAlign: "center", maxWidth: "80%" },
  msgRow:        { display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "4px" },
  msgAvatar:     { width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#ede9fe", color: "#6d28d9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "600", flexShrink: 0, marginBottom: "18px" },

  bubbleStudent:    { backgroundColor: "#818cf8", color: "white", padding: "10px 14px", borderRadius: "18px 18px 4px 18px", fontSize: "14px", lineHeight: 1.5, wordBreak: "break-word" },
  bubbleCounsellor: { backgroundColor: "white", color: "#111827", padding: "10px 14px", borderRadius: "18px 18px 18px 4px", fontSize: "14px", lineHeight: 1.5, border: "1px solid #f3f4f6", wordBreak: "break-word" },
  timestamp:     { margin: "4px 4px 8px", fontSize: "10px", color: "#9ca3af" },

  // Typing indicator
  typingBubble:  { backgroundColor: "white", border: "1px solid #f3f4f6", padding: "12px 16px", borderRadius: "18px 18px 18px 4px", display: "flex", gap: "5px", alignItems: "center", marginBottom: "22px" },
  dot1:          { width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#9ca3af", display: "inline-block" },
  dot2:          { width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#9ca3af", display: "inline-block" },
  dot3:          { width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#9ca3af", display: "inline-block" },

  // Input
  inputArea:     { padding: "16px 24px", backgroundColor: "white", borderTop: "1px solid #e5e7eb", display: "flex", gap: "12px", alignItems: "flex-end", flexShrink: 0 },
  input:         { flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", resize: "none", fontFamily: "Arial, sans-serif", lineHeight: 1.5 },
  sendBtn:       { padding: "10px 22px", borderRadius: "10px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: "500", flexShrink: 0 },
  sendBtnDisabled:{ padding: "10px 22px", borderRadius: "10px", border: "none", backgroundColor: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed", fontSize: "14px", flexShrink: 0 },

  sessionEndedBar:  { flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f9fafb", borderRadius: "10px", padding: "12px 16px" },
  sessionEndedText: { margin: 0, fontSize: "13px", color: "#6b7280" },
  newSessionBtn:    { padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "13px" },
};

export default ChatPage;
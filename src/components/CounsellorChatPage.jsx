import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../utils/useSocket";
import { logoutUser } from "../utils/auth";

/**
 * CounsellorChatPage – counsellor side of a live counselling session.
 *
 * Expects session object via router state:
 *   navigate("/counsellor-chat", { state: { session: { session_id, student_name, student_id } } })
 */
function CounsellorChat() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, token, authFetch } = useAuth();

  const session   = location.state?.session ?? null;
  const sessionId = session?.session_id ?? null;
  const studentName = session?.student_name ?? "Student";

  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState("");
  const [sessionEnded, setSessionEnded]   = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [studentTyping, setStudentTyping] = useState(false);
  const [noteText, setNoteText]           = useState("");
  const [noteSaved, setNoteSaved]         = useState(false);
  const [flagged, setFlagged]             = useState(false);
  const [showFlagConfirm, setShowFlagConfirm] = useState(false);
  const [showNotes, setShowNotes]         = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError]                 = useState(null);

  const bottomRef      = useRef(null);
  const inputRef       = useRef(null);
  const timerRef       = useRef(null);
  const typingDebounce = useRef(null);
  const msgId          = useRef(1);

  const navItems = [
    { label: "Dashboard",      path: "/counsellor-dashboard" },
    { label: "Active Session", path: "/counsellor-chat"      },
  ];

  // ── Load message history ────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) { setLoadingHistory(false); return; }

    authFetch(`/api/messages/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted = data.map((m) => ({
            id:     m.message_id,
            sender: m.sender_id === user?.user_id ? "counsellor" : "student",
            text:   m.message_text,
            time:   new Date(m.sent_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          }));
          setMessages(formatted);
          msgId.current = (data[data.length - 1]?.message_id ?? 0) + 1;
        }
      })
      .catch(() => setError("Could not load message history."))
      .finally(() => setLoadingHistory(false));
  }, [sessionId]); // eslint-disable-line

  // ── Socket.IO ───────────────────────────────────────────────────────────────
  const { sendMessage: socketSend, sendTyping, sendStopTyping } = useSocket(
    sessionId,
    token,
    {
      onMessage: (message) => {
        setMessages((prev) => [...prev, { ...message, id: msgId.current++ }]);
      },
      onTyping:     () => setStudentTyping(true),
      onStopTyping: () => setStudentTyping(false),
    }
  );

  // ── Session timer ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionEnded) {
      timerRef.current = setInterval(() => setSessionDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionEnded]);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, studentTyping]);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getNow = () =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  // ── Send message (DB + socket) ──────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sessionEnded || !sessionId) return;

    const optimisticMsg = {
      id:     msgId.current++,
      sender: "counsellor",
      text,
      time:   getNow(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInput("");
    inputRef.current?.focus();
    sendStopTyping(user?.user_id);

    try {
      const res = await authFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId, message_text: text }),
      });
      if (!res.ok) throw new Error("Failed to save message");
      const saved = await res.json();

      socketSend({
        sender:     "counsellor",
        text,
        time:       getNow(),
        message_id: saved.message_id,
        sender_id:  user?.user_id,
      });
    } catch (err) {
      console.error("Send message error:", err);
      setError("Message failed to send. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    }
  }, [input, sessionEnded, sessionId, user, authFetch, socketSend, sendStopTyping]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
      return;
    }
    sendTyping(user?.user_id);
    clearTimeout(typingDebounce.current);
    typingDebounce.current = setTimeout(() => sendStopTyping(user?.user_id), 2000);
  };

  // ── End session (DB) ────────────────────────────────────────────────────────
  const endSession = useCallback(async () => {
    clearInterval(timerRef.current);
    setSessionEnded(true);
    setShowEndConfirm(false);
    setMessages((prev) => [
      ...prev,
      { id: msgId.current++, sender: "system", text: "Session ended by counsellor.", time: getNow() },
    ]);

    if (sessionId) {
      try {
        await authFetch(`/api/sessions/${sessionId}`, {
          method: "PATCH",
          body: JSON.stringify({
            session_status: "completed",
            session_notes:  noteText.trim() || undefined,
          }),
        });
      } catch (err) {
        console.error("Failed to update session:", err);
      }
    }
  }, [sessionId, noteText, authFetch]);

  // ── Save notes (persisted to session record) ────────────────────────────────
  const handleSaveNote = useCallback(async () => {
    if (!sessionId || !noteText.trim()) return;
    try {
      await authFetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        body: JSON.stringify({ session_notes: noteText.trim() }),
      });
      setNoteSaved(true);
    } catch (err) {
      console.error("Save note error:", err);
      setError("Failed to save notes.");
    }
  }, [sessionId, noteText, authFetch]);

  // ── Flag session ─────────────────────────────────────────────────────────────
  const handleFlag = useCallback(async () => {
    setFlagged(true);
    setShowFlagConfirm(false);
    setMessages((prev) => [
      ...prev,
      { id: msgId.current++, sender: "system", text: "⚑ Session flagged — admin has been notified.", time: getNow() },
    ]);
    // The actual risk flag was already created automatically by the messages route
    // when high-risk keywords were detected. This is a manual flag from the counsellor.
    if (sessionId) {
      try {
        await authFetch("/api/messages", {
          method: "POST",
          body: JSON.stringify({
            session_id:   sessionId,
            message_text: "[COUNSELLOR FLAG] This session was manually flagged by the counsellor.",
          }),
        });
      } catch (err) {
        console.error("Flag error:", err);
      }
    }
  }, [sessionId, authFetch]);

  const handleLogout = () => { logoutUser(); navigate("/login"); };

  // ── No active session guard ─────────────────────────────────────────────────
  if (!session) {
    return (
      <div style={S.container}>
        <div style={S.sidebar}>
          <h2 style={S.logo}>Mind Haven</h2>
          {navItems.map((item) => (
            <button key={item.path} style={location.pathname === item.path ? S.navButtonActive : S.navButton} onClick={() => navigate(item.path)}>
              {item.label}
            </button>
          ))}
          <button style={S.logoutButton} onClick={handleLogout}>Logout</button>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6" }}>
          <div style={{ textAlign: "center", color: "#6b7280" }}>
            <p style={{ fontSize: "18px", fontWeight: 600 }}>No active session</p>
            <p style={{ fontSize: "14px" }}>Start a session from your dashboard by selecting a confirmed appointment.</p>
            <button style={{ ...S.backBtn, marginTop: "16px" }} onClick={() => navigate("/counsellor-dashboard")}>Go to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.container}>

      {/* Sidebar */}
      <div style={S.sidebar}>
        <h2 style={S.logo}>Mind Haven</h2>
        {navItems.map((item) => (
          <button key={item.path} style={location.pathname === item.path ? S.navButtonActive : S.navButton} onClick={() => navigate(item.path)}>
            {item.label}
          </button>
        ))}
        <button style={S.logoutButton} onClick={handleLogout}>Logout</button>
      </div>

      <div style={S.main}>
        {/* Chat column */}
        <div style={S.chatColumn}>

          {/* Header */}
          <div style={S.chatHeader}>
            <div style={S.headerLeft}>
              <div style={S.avatar}>{studentName.slice(0, 2).toUpperCase()}</div>
              <div>
                <p style={S.studentName}>{studentName}</p>
                <p style={S.studentMeta}>Session #{sessionId}</p>
              </div>
            </div>
            <div style={S.headerRight}>
              <div style={S.sessionTimer}>
                <span style={S.timerDot} />
                {formatDuration(sessionDuration)}
              </div>
              {!flagged && !sessionEnded && (
                <button style={S.flagBtn} onClick={() => setShowFlagConfirm(true)}>⚑ Flag</button>
              )}
              {flagged && <span style={S.flaggedBadge}>⚑ Flagged</span>}
              {!sessionEnded && (
                <button style={S.endBtn} onClick={() => setShowEndConfirm(true)}>End Session</button>
              )}
              {sessionEnded && (
                <button style={S.backBtn} onClick={() => navigate("/counsellor-dashboard")}>Dashboard</button>
              )}
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div style={S.errorBanner}>
              <p style={{ margin: 0, fontSize: "13px" }}>{error}</p>
              <button style={S.errorClose} onClick={() => setError(null)}>✕</button>
            </div>
          )}

          {/* End-session confirm */}
          {showEndConfirm && (
            <div style={S.confirmBanner}>
              <p style={S.confirmText}>End this session? Notes will be saved.</p>
              <div style={S.confirmBtns}>
                <button style={S.confirmYes} onClick={endSession}>Yes, end session</button>
                <button style={S.confirmNo}  onClick={() => setShowEndConfirm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Flag confirm */}
          {showFlagConfirm && (
            <div style={{ ...S.confirmBanner, backgroundColor: "#fff7ed", borderColor: "#fed7aa" }}>
              <p style={{ ...S.confirmText, color: "#c2410c" }}>Flag this session and notify admin?</p>
              <div style={S.confirmBtns}>
                <button style={{ ...S.confirmYes, backgroundColor: "#ea580c" }} onClick={handleFlag}>Yes, flag session</button>
                <button style={S.confirmNo} onClick={() => setShowFlagConfirm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={S.messagesArea}>
            <div style={S.sessionPill}>
              Session started · {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </div>

            {loadingHistory && <p style={{ color: "#9ca3af", textAlign: "center", fontSize: "13px" }}>Loading messages…</p>}

            {messages.map((msg) => {
              if (msg.sender === "system") {
                return <div key={msg.id} style={S.systemMsg}><span>{msg.text}</span></div>;
              }
              const isCounsellor = msg.sender === "counsellor";
              return (
                <div key={msg.id} style={{ ...S.msgRow, justifyContent: isCounsellor ? "flex-end" : "flex-start" }}>
                  {!isCounsellor && <div style={S.msgAvatar}>{studentName.slice(0, 2).toUpperCase()}</div>}
                  <div style={{ maxWidth: "65%" }}>
                    <div style={isCounsellor ? S.bubbleCounsellor : S.bubbleStudent}>{msg.text}</div>
                    <p style={{ ...S.timestamp, textAlign: isCounsellor ? "right" : "left" }}>{msg.time}</p>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {studentTyping && (
              <div style={{ ...S.msgRow, justifyContent: "flex-start" }}>
                <div style={S.msgAvatar}>{studentName.slice(0, 2).toUpperCase()}</div>
                <div style={S.typingBubble}>
                  <span className="dot1" style={S.dot} />
                  <span className="dot2" style={S.dot} />
                  <span className="dot3" style={S.dot} />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={S.inputArea}>
            {sessionEnded ? (
              <div style={S.sessionEndedBar}>
                <p style={S.sessionEndedText}>Session ended.</p>
                <button style={{ ...S.backBtn }} onClick={() => navigate("/counsellor-dashboard")}>Back to Dashboard</button>
              </div>
            ) : (
              <>
                <textarea
                  ref={inputRef}
                  style={S.input}
                  rows={1}
                  placeholder="Type a response… (Enter to send)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  style={input.trim() ? S.sendBtn : S.sendBtnDisabled}
                  onClick={sendMessage}
                  disabled={!input.trim()}
                >
                  Send
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div style={S.rightPanel}>
          <div style={S.panelTabs}>
            <button style={showNotes ? S.panelTabActive : S.panelTab} onClick={() => setShowNotes(true)}>Notes</button>
            <button style={!showNotes ? S.panelTabActive : S.panelTab} onClick={() => setShowNotes(false)}>Student</button>
          </div>

          {showNotes ? (
            <div style={S.panelBody}>
              <p style={S.panelLabel}>Private session notes</p>
              <p style={S.panelHint}>Only visible to you and admins.</p>
              <textarea
                style={S.notesInput}
                rows={10}
                placeholder="Record observations, topics discussed, follow-up actions..."
                value={noteText}
                onChange={(e) => { setNoteText(e.target.value); setNoteSaved(false); }}
              />
              {noteSaved ? (
                <p style={S.savedText}>✓ Notes saved</p>
              ) : (
                <button
                  style={noteText.trim() ? S.saveNoteBtn : S.saveNoteBtnDisabled}
                  onClick={handleSaveNote}
                  disabled={!noteText.trim()}
                >
                  Save Notes
                </button>
              )}

              <p style={{ ...S.panelLabel, marginTop: "20px" }}>Quick prompts</p>
              {["Discussed coping strategies", "Referred to professional", "Follow-up needed", "Risk assessed — low"].map((prompt) => (
                <button key={prompt} style={S.promptBtn} onClick={() => {
                  setNoteText((prev) => prev ? prev + "\n• " + prompt : "• " + prompt);
                  setNoteSaved(false);
                }}>
                  + {prompt}
                </button>
              ))}
            </div>
          ) : (
            <div style={S.panelBody}>
              <div style={S.studentCard}>
                <div style={S.studentAvatarLg}>{studentName.slice(0, 2).toUpperCase()}</div>
                <p style={S.studentCardName}>{studentName}</p>
                <p style={S.studentCardSub}>Session #{sessionId}</p>
              </div>

              <div style={S.infoSection}>
                <p style={S.panelLabel}>Session details</p>
                {[
                  { label: "Date",     value: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
                  { label: "Duration", value: formatDuration(sessionDuration) },
                  { label: "Status",   value: sessionEnded ? "Completed" : "In progress" },
                ].map((r) => (
                  <div key={r.label} style={S.infoRow}>
                    <span style={S.infoLabel}>{r.label}</span>
                    <span style={S.infoValue}>{r.value}</span>
                  </div>
                ))}
              </div>

              <div style={S.infoSection}>
                <p style={S.panelLabel}>Risk status</p>
                <span style={flagged ? S.riskHigh : S.riskLow}>
                  {flagged ? "⚑ Flagged — admin notified" : "✓ No flags raised"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// keyframe injection
const styleTag = document.createElement("style");
styleTag.textContent = `
  @keyframes blink {
    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
    40%            { opacity: 1;   transform: scale(1);   }
  }
  .dot1 { animation: blink 1.2s infinite 0s;   }
  .dot2 { animation: blink 1.2s infinite 0.2s; }
  .dot3 { animation: blink 1.2s infinite 0.4s; }
  @keyframes pulse {
    0%, 100% { opacity: 1;   }
    50%       { opacity: 0.4; }
  }
  .timer-dot { animation: pulse 1.5s infinite; }
`;
if (!document.head.querySelector("#counsellor-chat-styles")) {
  styleTag.id = "counsellor-chat-styles";
  document.head.appendChild(styleTag);
}

const S = {
  container: { display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" },
  sidebar:         { width: "240px", backgroundColor: "#111827", color: "white", display: "flex", flexDirection: "column", padding: "25px 20px", gap: "10px", flexShrink: 0 },
  logo:            { fontSize: "20px", marginBottom: "20px" },
  navButton:       { padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "#9ca3af", cursor: "pointer", textAlign: "left", fontSize: "14px" },
  navButtonActive: { padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", textAlign: "left", fontSize: "14px" },
  logoutButton:    { marginTop: "auto", padding: "10px", borderRadius: "8px", border: "1px solid #4b5563", backgroundColor: "transparent", color: "white", cursor: "pointer" },
  main:       { flex: 1, display: "flex", overflow: "hidden", backgroundColor: "#f3f4f6" },
  chatColumn: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  rightPanel: { width: "300px", flexShrink: 0, backgroundColor: "white", borderLeft: "1px solid #e5e7eb", display: "flex", flexDirection: "column", overflow: "hidden" },
  chatHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", backgroundColor: "white", borderBottom: "1px solid #e5e7eb", flexShrink: 0 },
  headerLeft:  { display: "flex", alignItems: "center", gap: "12px" },
  avatar:      { width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e0f2fe", color: "#0369a1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "12px", flexShrink: 0 },
  studentName: { margin: 0, fontWeight: "600", fontSize: "15px", color: "#111827" },
  studentMeta: { margin: "3px 0 0", fontSize: "12px", color: "#9ca3af" },
  headerRight: { display: "flex", alignItems: "center", gap: "10px" },
  sessionTimer:{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280", backgroundColor: "#f9fafb", padding: "6px 12px", borderRadius: "20px", border: "1px solid #e5e7eb" },
  timerDot:    { width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#ef4444", display: "inline-block" },
  flagBtn:     { padding: "7px 13px", borderRadius: "8px", border: "1px solid #ea580c", backgroundColor: "white", color: "#ea580c", cursor: "pointer", fontSize: "12px", fontWeight: "500" },
  flaggedBadge:{ padding: "5px 12px", borderRadius: "20px", backgroundColor: "#fff7ed", color: "#c2410c", fontSize: "12px", fontWeight: "500", border: "1px solid #fed7aa" },
  endBtn:      { padding: "7px 14px", borderRadius: "8px", border: "1px solid #dc2626", backgroundColor: "white", color: "#dc2626", cursor: "pointer", fontSize: "13px", fontWeight: "500" },
  backBtn:     { padding: "7px 14px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "13px" },
  errorBanner: { backgroundColor: "#fef2f2", borderBottom: "1px solid #fecaca", padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  errorClose:  { background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: "16px" },
  confirmBanner: { backgroundColor: "#fff7f7", borderBottom: "1px solid #fecaca", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  confirmText:   { margin: 0, fontSize: "13px", color: "#dc2626" },
  confirmBtns:   { display: "flex", gap: "8px" },
  confirmYes:    { padding: "6px 14px", borderRadius: "8px", border: "none", backgroundColor: "#dc2626", color: "white", cursor: "pointer", fontSize: "13px" },
  confirmNo:     { padding: "6px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "white", color: "#6b7280", cursor: "pointer", fontSize: "13px" },
  messagesArea: { flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "4px" },
  sessionPill:  { alignSelf: "center", backgroundColor: "#e5e7eb", color: "#6b7280", fontSize: "11px", padding: "4px 14px", borderRadius: "20px", marginBottom: "16px" },
  systemMsg:    { alignSelf: "center", backgroundColor: "#fff7ed", color: "#c2410c", fontSize: "12px", padding: "6px 16px", borderRadius: "20px", margin: "12px 0", textAlign: "center", maxWidth: "80%", border: "1px solid #fed7aa" },
  msgRow:       { display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "4px" },
  msgAvatar:    { width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#e0f2fe", color: "#0369a1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "600", flexShrink: 0, marginBottom: "18px" },
  bubbleCounsellor: { backgroundColor: "#818cf8", color: "white", padding: "10px 14px", borderRadius: "18px 18px 4px 18px", fontSize: "14px", lineHeight: 1.5, wordBreak: "break-word" },
  bubbleStudent:    { backgroundColor: "white", color: "#111827", padding: "10px 14px", borderRadius: "18px 18px 18px 4px", fontSize: "14px", lineHeight: 1.5, border: "1px solid #f3f4f6", wordBreak: "break-word" },
  timestamp:    { margin: "4px 4px 8px", fontSize: "10px", color: "#9ca3af" },
  typingBubble: { backgroundColor: "white", border: "1px solid #f3f4f6", padding: "12px 16px", borderRadius: "18px 18px 18px 4px", display: "flex", gap: "5px", alignItems: "center", marginBottom: "22px" },
  dot:          { width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#9ca3af", display: "inline-block" },
  inputArea:    { padding: "16px 24px", backgroundColor: "white", borderTop: "1px solid #e5e7eb", display: "flex", gap: "12px", alignItems: "flex-end", flexShrink: 0 },
  input:        { flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", resize: "none", fontFamily: "Arial, sans-serif", lineHeight: 1.5 },
  sendBtn:      { padding: "10px 22px", borderRadius: "10px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: "500", flexShrink: 0 },
  sendBtnDisabled: { padding: "10px 22px", borderRadius: "10px", border: "none", backgroundColor: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed", fontSize: "14px", flexShrink: 0 },
  sessionEndedBar:  { flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f9fafb", borderRadius: "10px", padding: "12px 16px" },
  sessionEndedText: { margin: 0, fontSize: "13px", color: "#6b7280" },
  panelTabs:      { display: "flex", borderBottom: "1px solid #e5e7eb", flexShrink: 0 },
  panelTab:       { flex: 1, padding: "12px", border: "none", backgroundColor: "white", color: "#9ca3af", cursor: "pointer", fontSize: "12px", fontWeight: "500" },
  panelTabActive: { flex: 1, padding: "12px", border: "none", backgroundColor: "white", color: "#818cf8", cursor: "pointer", fontSize: "12px", fontWeight: "600", borderBottom: "2px solid #818cf8" },
  panelBody:      { flex: 1, overflowY: "auto", padding: "16px" },
  panelLabel:     { margin: "0 0 6px", fontSize: "12px", fontWeight: "600", color: "#374151" },
  panelHint:      { margin: "0 0 10px", fontSize: "11px", color: "#9ca3af" },
  notesInput:          { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "Arial, sans-serif", marginBottom: "10px", boxSizing: "border-box" },
  saveNoteBtn:         { padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "13px", width: "100%" },
  saveNoteBtnDisabled: { padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed", fontSize: "13px", width: "100%" },
  savedText:           { color: "#16a34a", fontSize: "13px", margin: "4px 0 0", textAlign: "center" },
  promptBtn: { display: "block", width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: "6px", border: "1px solid #e5e7eb", backgroundColor: "white", color: "#374151", cursor: "pointer", fontSize: "12px", marginBottom: "6px" },
  studentCard:     { textAlign: "center", padding: "16px 0 20px", borderBottom: "1px solid #f3f4f6", marginBottom: "16px" },
  studentAvatarLg: { width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#e0f2fe", color: "#0369a1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "16px", margin: "0 auto 10px" },
  studentCardName: { margin: "0 0 4px", fontWeight: "600", fontSize: "15px", color: "#111827" },
  studentCardSub:  { margin: 0, fontSize: "12px", color: "#9ca3af" },
  infoSection: { marginBottom: "20px" },
  infoRow:     { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f9fafb", fontSize: "12px" },
  infoLabel:   { color: "#9ca3af" },
  infoValue:   { color: "#374151", fontWeight: "500" },
  riskLow:  { display: "inline-block", padding: "4px 12px", borderRadius: "20px", backgroundColor: "#dcfce7", color: "#16a34a", fontSize: "12px", fontWeight: "500" },
  riskHigh: { display: "inline-block", padding: "4px 12px", borderRadius: "20px", backgroundColor: "#fff7ed", color: "#c2410c", fontSize: "12px", fontWeight: "500" },
};

export default CounsellorChat;
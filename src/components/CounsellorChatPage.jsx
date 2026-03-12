import React, { useState, useRef, useEffect } from "react";

function CounsellorChatPage() {
  const [messages, setMessages] = useState([
    {
      text: "Hello, thank you for connecting. How are you feeling today?",
      sender: "counsellor",
      time: getTime()
    }
  ]);
  const [input, setInput] = useState("");
  const [sessionActive, setSessionActive] = useState(true);
  const messagesEndRef = useRef(null);

  function getTime() {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  const sendMessage = () => {
    if (!input.trim() || !sessionActive) return;

    const newMessage = {
      text: input,
      sender: "counsellor",
      time: getTime()
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  const endSession = () => {
    setSessionActive(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={{ margin: 0 }}>Client Session</h3>
          <span
            style={{
              ...styles.status,
              backgroundColor: sessionActive ? "#22c55e" : "#ef4444"
            }}
          >
            {sessionActive ? "Client Connected" : "Session Closed"}
          </span>
        </div>

        {sessionActive && (
          <button style={styles.endButton} onClick={endSession}>
            End Session
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.messageWrapper,
              alignItems:
                msg.sender === "counsellor" ? "flex-end" : "flex-start"
            }}
          >
            <div
              style={{
                ...styles.messageBubble,
                backgroundColor:
                  msg.sender === "counsellor"
                    ? "#ddd6fe"
                    : "#e5e7eb"
              }}
            >
              {msg.text}
              <div style={styles.timestamp}>{msg.time}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder={
            sessionActive
              ? "Reply to client..."
              : "Session closed"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.input}
          disabled={!sessionActive}
        />
        <button
          onClick={sendMessage}
          style={styles.sendButton}
          disabled={!sessionActive}
        >
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#eef2ff"
  },

  header: {
    padding: "18px 25px",
    backgroundColor: "#818cf8",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  },

  status: {
    fontSize: "12px",
    padding: "4px 10px",
    borderRadius: "12px",
    display: "inline-block",
    marginTop: "6px"
  },

  endButton: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#dc2626",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold"
  },

  messagesContainer: {
    flex: 1,
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    overflowY: "auto",
    maxWidth: "900px",
    width: "100%",
    margin: "0 auto"
  },

  messageWrapper: {
    display: "flex",
    width: "100%"
  },

  messageBubble: {
    padding: "12px 18px",
    borderRadius: "18px",
    maxWidth: "55%",
    fontSize: "14px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
  },

  timestamp: {
    fontSize: "10px",
    marginTop: "6px",
    opacity: 0.6,
    alignSelf: "flex-end"
  },

  inputContainer: {
    display: "flex",
    padding: "20px",
    backgroundColor: "white",
    borderTop: "1px solid #e5e7eb",
    maxWidth: "900px",
    width: "100%",
    margin: "0 auto"
  },

  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #c7d2fe",
    marginRight: "12px"
  },

  sendButton: {
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#a5b4fc",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold"
  }
};

export default CounsellorChatPage;
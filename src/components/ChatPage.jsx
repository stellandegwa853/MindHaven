import React, { useState, useRef, useEffect } from "react";

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionActive, setSessionActive] = useState(true);
  const messagesEndRef = useRef(null);

  const getTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const sendMessage = () => {
    if (!input.trim() || !sessionActive) return;

    const newMessage = {
      text: input,
      sender: "user",
      time: getTime()
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Fake counsellor reply (only if session still active)
    setTimeout(() => {
      if (!sessionActive) return;

      const reply = {
        text: "Thank you for sharing. I'm here with you. Tell me more about how you're feeling.",
        sender: "counsellor",
        time: getTime()
      };

      setMessages((prev) => [...prev, reply]);
    }, 1500);
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
          <h3 style={{ margin: 0 }}>Peer Support Chat</h3>
          <span
            style={{
              ...styles.status,
              backgroundColor: sessionActive ? "#22c55e" : "#ef4444"
            }}
          >
            {sessionActive ? "Session Active" : "Session Ended"}
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
              alignItems: msg.sender === "user" ? "flex-end" : "flex-start"
            }}
          >
            <div
              style={{
                ...styles.messageBubble,
                backgroundColor:
                  msg.sender === "user" ? "#c7d2fe" : "#e5e7eb"
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
              ? "Type your message..."
              : "Session has ended"
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
    backgroundColor: "#f3f4f6"
  },

  header: {
    padding: "15px 20px",
    backgroundColor: "#818cf8",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  status: {
    fontSize: "12px",
    padding: "4px 8px",
    borderRadius: "12px",
    display: "inline-block",
    marginTop: "5px"
  },

  endButton: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#ef4444",
    color: "white",
    cursor: "pointer"
  },

  messagesContainer: {
    flex: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    overflowY: "auto"
  },

  messageWrapper: {
    display: "flex",
    width: "100%"
  },

  messageBubble: {
    padding: "10px 15px",
    borderRadius: "18px",
    maxWidth: "60%",
    fontSize: "14px",
    display: "flex",
    flexDirection: "column"
  },

  timestamp: {
    fontSize: "10px",
    marginTop: "5px",
    opacity: 0.6,
    alignSelf: "flex-end"
  },

  inputContainer: {
    display: "flex",
    padding: "15px",
    backgroundColor: "white",
    borderTop: "1px solid #e5e7eb"
  },

  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    marginRight: "10px"
  },

  sendButton: {
    padding: "10px 15px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#818cf8",
    color: "white",
    cursor: "pointer"
  }
};

export default ChatPage;
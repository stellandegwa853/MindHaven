import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { API_BASE } from "../context/AuthContext";

/**
 * useSocket – creates an authenticated Socket.IO connection for a session.
 *
 * @param {string|number|null} sessionId  – the active session ID (null = not connected)
 * @param {string|null}        token      – the JWT from AuthContext
 * @param {object}             handlers   – { onMessage, onUserJoined, onUserLeft, onTyping, onStopTyping }
 * @returns {{ sendMessage, sendTyping, sendStopTyping, leaveSession }}
 */
export function useSocket(sessionId, token, handlers = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!sessionId || !token) return;

    // Connect with auth token so the server can verify the user
    const socket = io(API_BASE, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_session", { sessionId, userId: null }); // userId filled server-side via token
    });

    socket.on("receive_message", (message) => {
      handlers.onMessage?.(message);
    });

    socket.on("user_joined", ({ userId }) => {
      handlers.onUserJoined?.(userId);
    });

    socket.on("user_left", () => {
      handlers.onUserLeft?.();
    });

    socket.on("user_typing", ({ userId }) => {
      handlers.onTyping?.(userId);
    });

    socket.on("user_stop_typing", ({ userId }) => {
      handlers.onStopTyping?.(userId);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      socket.emit("leave_session", { sessionId });
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, token]);

  const sendMessage = (message) => {
    socketRef.current?.emit("send_message", { sessionId, message });
  };

  const sendTyping = (userId) => {
    socketRef.current?.emit("typing", { sessionId, userId });
  };

  const sendStopTyping = (userId) => {
    socketRef.current?.emit("stop_typing", { sessionId, userId });
  };

  const leaveSession = () => {
    socketRef.current?.emit("leave_session", { sessionId });
  };

  return { sendMessage, sendTyping, sendStopTyping, leaveSession };
}
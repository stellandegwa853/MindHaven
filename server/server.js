require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const http       = require("http");
const jwt        = require("jsonwebtoken");
const { Server } = require("socket.io");

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: false,
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/auth",         require("./routes/auth"));
app.use("/api/users",        require("./routes/users"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/sessions",     require("./routes/sessions"));
app.use("/api/messages",     require("./routes/messages"));
app.use("/api/journal",      require("./routes/journal"));
app.use("/api/resources",    require("./routes/resources"));
app.use("/api/mood",         require("./routes/mood"));
app.use("/api/admin",        require("./routes/admin"));
app.use("/api/ai-chat",      require("./routes/aiChat"));

app.get("/",          (req, res) => res.send("Mind Haven API is running..."));
app.get("/api/health",(req, res) => res.json({ status: "ok", timestamp: new Date() }));

// ── Socket.IO authentication middleware ───────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication required"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid or expired token"));
  }
});

// ── Socket.IO event handlers ─────────────────────────────────────────────────
io.on("connection", (socket) => {
  const { user_id, role } = socket.user;
  console.log(`Socket connected: ${socket.id} | user=${user_id} role=${role}`);

  socket.on("join_session", ({ sessionId }) => {
    socket.join(`session_${sessionId}`);
    socket.to(`session_${sessionId}`).emit("user_joined", { userId: user_id });
    console.log(`User ${user_id} joined session_${sessionId}`);
  });

  socket.on("send_message", ({ sessionId, message }) => {
    socket.to(`session_${sessionId}`).emit("receive_message", message);
  });

  socket.on("typing", ({ sessionId }) => {
    socket.to(`session_${sessionId}`).emit("user_typing", { userId: user_id });
  });

  socket.on("stop_typing", ({ sessionId }) => {
    socket.to(`session_${sessionId}`).emit("user_stop_typing", { userId: user_id });
  });

  socket.on("leave_session", ({ sessionId }) => {
    socket.leave(`session_${sessionId}`);
    socket.to(`session_${sessionId}`).emit("user_left");
    console.log(`User ${user_id} left session_${sessionId}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${socket.id} | reason=${reason}`);
  });

  socket.on("error", (err) => {
    console.error(`Socket error for user ${user_id}:`, err.message);
  });
});

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Mind Haven server running on port ${PORT}`);
});
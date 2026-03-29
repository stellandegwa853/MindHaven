require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const http       = require("http");
const { Server } = require("socket.io");

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://mind-haven-tshx.vercel.app",
      "https://mindhaven.vercel.app",
      "https://dashboard.render.com",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://mind-haven-tshx.vercel.app",
    "https://mindhaven.vercel.app",
    "https://dashboard.render.com",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
}));
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

app.get("/", (req, res) => res.send("Mind Haven API is running..."));
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("join_session", ({ sessionId, userId }) => {
    socket.join(`session_${sessionId}`);
    socket.to(`session_${sessionId}`).emit("user_joined", { userId });
  });
  socket.on("send_message", ({ sessionId, message }) => {
    socket.to(`session_${sessionId}`).emit("receive_message", message);
  });
  socket.on("typing", ({ sessionId, userId }) => {
    socket.to(`session_${sessionId}`).emit("user_typing", { userId });
  });
  socket.on("stop_typing", ({ sessionId, userId }) => {
    socket.to(`session_${sessionId}`).emit("user_stop_typing", { userId });
  });
  socket.on("leave_session", ({ sessionId }) => {
    socket.leave(`session_${sessionId}`);
    socket.to(`session_${sessionId}`).emit("user_left");
  });
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
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
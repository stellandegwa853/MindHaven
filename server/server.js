const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ CORS CONFIG
app.use(cors({
  origin: [
    "http://localhost:5173",             // local dev
    "https://your-site-name.netlify.app" // replace with your Netlify URL
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Middleware
app.use(express.json());

// Routes
const aiChatRoutes = require("./routes/aiChat");
const authRoutes = require("./routes/auth");

app.use("/api/ai-chat", aiChatRoutes);
app.use("/api/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
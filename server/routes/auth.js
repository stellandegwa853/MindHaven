const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const auth = require("../middleware/auth");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { full_name, email, password, role = "student" } = req.body;

  if (!full_name || !email || !password) return res.status(400).json({ error: "Name, email and password required" });
  if (!["student","counsellor"].includes(role)) return res.status(400).json({ error: "Role must be student or counsellor" });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

  try {
    const [existing] = await db.query("SELECT user_id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(409).json({ error: "Email already exists" });

    const password_hash = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [full_name, email, password_hash, role]
    );
    const user_id = result.insertId;

    if (role === "student") await db.query("INSERT INTO student_profiles (user_id) VALUES (?)", [user_id]);
    else await db.query("INSERT INTO counsellor_profiles (user_id) VALUES (?)", [user_id]);

    const token = jwt.sign({ user_id, email, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

    res.status(201).json({ message: "Account created", token, user: { user_id, full_name, email, role } });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    if (!user.is_active) return res.status(403).json({ error: "Account suspended" });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    if (user.role === "counsellor" && !user.is_verified) return res.status(403).json({ error: "Awaiting admin approval" });

    const token = jwt.sign({ user_id: user.user_id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

    res.json({ message: "Login successful", token, user: { user_id: user.user_id, full_name: user.full_name, email: user.email, role: user.role } });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET CURRENT USER
router.get("/me", auth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT user_id, full_name, email, role FROM users WHERE user_id = ?", [req.user.user_id]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGOUT
router.post("/logout", auth, (req, res) => {
  res.json({ message: "Logged out successfully" });
});

module.exports = router; 
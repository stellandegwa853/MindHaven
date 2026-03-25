const express = require("express");
const db      = require("../config/db");
const auth    = require("../middleware/auth");

const router = express.Router();

// GET /api/mood — last 30 days for the logged-in student
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM mood_tracker WHERE student_id = ? ORDER BY logged_date DESC LIMIT 30",
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// POST /api/mood — log today's mood (one per day enforced by DB unique key)
router.post("/", auth, async (req, res) => {
  const { mood_score, note } = req.body;
  if (!mood_score || mood_score < 1 || mood_score > 5) {
    return res.status(400).json({ error: "mood_score must be between 1 and 5" });
  }
  try {
    const today = new Date().toISOString().split("T")[0];
    await db.query(
      "INSERT INTO mood_tracker (student_id, mood_score, note, logged_date) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE mood_score = ?, note = ?",
      [req.user.user_id, mood_score, note || null, today, mood_score, note || null]
    );
    res.status(201).json({ message: "Mood logged" });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

module.exports = router;
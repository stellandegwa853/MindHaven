const express = require("express");
const db      = require("../config/db");
const auth    = require("../middleware/auth");

const router = express.Router();

const RISK_KEYWORDS = [
  "kill myself", "end my life", "want to die", "suicidal", "self harm",
  "cut myself", "no reason to live", "can't go on",
];

function detectRisk(text) {
  const lower = text.toLowerCase();
  const found = RISK_KEYWORDS.filter((kw) => lower.includes(kw));
  return found.length > 0 ? found.join(", ") : null;
}

// ── GET /api/journal ──────────────────────────────────────────────────────────
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT entry_id, title, mood, created_at, updated_at, LEFT(body, 120) AS preview FROM journal_entries WHERE student_id = ? ORDER BY created_at DESC",
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── GET /api/journal/:id ──────────────────────────────────────────────────────
router.get("/:id", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM journal_entries WHERE entry_id = ? AND student_id = ?",
      [req.params.id, req.user.user_id]
    );
    if (!rows.length) return res.status(404).json({ error: "Entry not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── POST /api/journal ─────────────────────────────────────────────────────────
router.post("/", auth, async (req, res) => {
  const { title, body, mood } = req.body;
  const student_id = req.user.user_id;

  if (!body?.trim()) return res.status(400).json({ error: "Body is required" });

  const validMoods = ["great", "good", "okay", "low", "very_low", null, undefined];
  if (!validMoods.includes(mood)) {
    return res.status(400).json({ error: "Invalid mood value" });
  }

  try {
    const riskKeywords = detectRisk(body);
    const is_flagged   = !!riskKeywords;

    const [result] = await db.query(
      "INSERT INTO journal_entries (student_id, title, body, mood, is_flagged) VALUES (?, ?, ?, ?, ?)",
      [student_id, title?.trim() || null, body.trim(), mood || null, is_flagged]
    );

    if (riskKeywords) {
      await db.query(
        "INSERT INTO risk_flags (student_id, source_type, source_id, risk_level, trigger_keyword) VALUES (?, 'journal', ?, 'high', ?)",
        [student_id, result.insertId, riskKeywords]
      );
    }

    res.status(201).json({ message: "Entry saved", entry_id: result.insertId, is_flagged });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── PUT /api/journal/:id ──────────────────────────────────────────────────────
router.put("/:id", auth, async (req, res) => {
  const { title, body, mood } = req.body;
  const { user_id } = req.user;

  if (!body?.trim()) return res.status(400).json({ error: "Body is required" });

  try {
    const [existing] = await db.query(
      "SELECT entry_id FROM journal_entries WHERE entry_id = ? AND student_id = ?",
      [req.params.id, user_id]
    );
    if (!existing.length) return res.status(404).json({ error: "Entry not found" });

    await db.query(
      "UPDATE journal_entries SET title = ?, body = ?, mood = ? WHERE entry_id = ? AND student_id = ?",
      [title?.trim() || null, body.trim(), mood || null, req.params.id, user_id]
    );
    res.json({ message: "Entry updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── DELETE /api/journal/:id ───────────────────────────────────────────────────
router.delete("/:id", auth, async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM journal_entries WHERE entry_id = ? AND student_id = ?",
      [req.params.id, req.user.user_id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Entry not found" });
    res.json({ message: "Entry deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
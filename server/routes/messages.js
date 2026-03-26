const express   = require("express");
const db        = require("../config/db");
const auth      = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

// Simple keyword-based risk detection
const RISK_KEYWORDS = [
  "kill myself", "end my life", "want to die", "suicidal", "self harm",
  "cut myself", "no reason to live", "can't go on", "give up on life",
];

function detectRisk(text) {
  const lower = text.toLowerCase();
  const found = RISK_KEYWORDS.filter((kw) => lower.includes(kw));
  if (found.length === 0) return null;
  return { level: "high", keywords: found.join(", ") };
}

// ── GET /api/messages/:session_id ─────────────────────────────────────────────
router.get("/:session_id", auth, async (req, res) => {
  const { session_id } = req.params;
  const { user_id, role } = req.user;

  try {
    // Verify the user belongs to this session
    const [session] = await db.query(
      `SELECT a.student_id, a.counsellor_id FROM sessions s
       JOIN appointments a ON s.appointment_id = a.appointment_id
       WHERE s.session_id = ?`,
      [session_id]
    );
    if (!session.length) return res.status(404).json({ error: "Session not found" });

    const s = session[0];
    if (role !== "admin" && s.student_id !== user_id && s.counsellor_id !== user_id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const [messages] = await db.query(
      `SELECT m.*, u.full_name AS sender_name, u.role AS sender_role
       FROM messages m JOIN users u ON m.sender_id = u.user_id
       WHERE m.session_id = ?
       ORDER BY m.sent_at ASC`,
      [session_id]
    );
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── POST /api/messages ────────────────────────────────────────────────────────
router.post("/", auth, async (req, res) => {
  const { session_id, message_text } = req.body;
  const sender_id = req.user.user_id;

  if (!session_id || !message_text?.trim()) {
    return res.status(400).json({ error: "session_id and message_text are required" });
  }

  try {
    // Risk detection
    const risk = detectRisk(message_text);
    const is_flagged = !!risk;

    const [result] = await db.query(
      "INSERT INTO messages (session_id, sender_id, message_text, is_flagged) VALUES (?, ?, ?, ?)",
      [session_id, sender_id, message_text.trim(), is_flagged]
    );

    // If risk detected, create a risk flag record and notify admins
    if (risk) {
      await db.query(
        "INSERT INTO risk_flags (student_id, source_type, source_id, risk_level, trigger_keyword) VALUES (?, 'message', ?, ?, ?)",
        [sender_id, result.insertId, risk.level, risk.keywords]
      );

      // Notify all admins
      const [admins] = await db.query("SELECT user_id FROM users WHERE role = 'admin'");
      for (const admin of admins) {
        await db.query(
          "INSERT INTO notifications (user_id, title, body, notif_type) VALUES (?, ?, ?, 'risk_alert')",
          [admin.user_id, "Risk flag raised", `A high-risk message was detected in session #${session_id}.`]
        );
      }
    }

    res.status(201).json({
      message_id:   result.insertId,
      session_id,
      sender_id,
      message_text: message_text.trim(),
      is_flagged,
      sent_at:      new Date(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
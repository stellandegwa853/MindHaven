const express   = require("express");
const db        = require("../config/db");
const auth      = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

// ── GET /api/sessions ─────────────────────────────────────────────────────────
router.get("/", auth, async (req, res) => {
  const { user_id, role } = req.user;
  try {
    let query, params;
    if (role === "student") {
      query = `SELECT s.*, a.scheduled_date, a.start_time, a.end_time, u.full_name AS counsellor_name
               FROM sessions s
               JOIN appointments a ON s.appointment_id = a.appointment_id
               JOIN users u ON a.counsellor_id = u.user_id
               WHERE a.student_id = ?
               ORDER BY a.scheduled_date DESC`;
      params = [user_id];
    } else if (role === "counsellor") {
      query = `SELECT s.*, a.scheduled_date, a.start_time, a.end_time
               FROM sessions s
               JOIN appointments a ON s.appointment_id = a.appointment_id
               WHERE a.counsellor_id = ?
               ORDER BY a.scheduled_date DESC`;
      params = [user_id];
    } else {
      query = `SELECT s.*, a.scheduled_date, su.full_name AS student_name, cu.full_name AS counsellor_name
               FROM sessions s
               JOIN appointments a ON s.appointment_id = a.appointment_id
               JOIN users su ON a.student_id = su.user_id
               JOIN users cu ON a.counsellor_id = cu.user_id
               ORDER BY a.scheduled_date DESC`;
      params = [];
    }
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── POST /api/sessions ────────────────────────────────────────────────────────
// Create a session from a confirmed appointment
router.post("/", auth, roleCheck("counsellor", "admin"), async (req, res) => {
  const { appointment_id } = req.body;
  if (!appointment_id) return res.status(400).json({ error: "appointment_id is required" });

  try {
    const [appt] = await db.query(
      "SELECT * FROM appointments WHERE appointment_id = ? AND status = 'confirmed'",
      [appointment_id]
    );
    if (!appt.length) return res.status(404).json({ error: "Confirmed appointment not found" });

    // Prevent duplicate sessions
    const [existing] = await db.query(
      "SELECT session_id FROM sessions WHERE appointment_id = ?", [appointment_id]
    );
    if (existing.length) return res.status(409).json({ error: "Session already exists for this appointment" });

    const [result] = await db.query(
      "INSERT INTO sessions (appointment_id, started_at, session_status) VALUES (?, NOW(), 'in_progress')",
      [appointment_id]
    );

    // Update appointment status to completed once session starts
    await db.query(
      "UPDATE appointments SET status = 'completed' WHERE appointment_id = ?", [appointment_id]
    );

    res.status(201).json({ message: "Session started", session_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── PATCH /api/sessions/:id ───────────────────────────────────────────────────
// End session, add notes
router.patch("/:id", auth, roleCheck("counsellor", "admin"), async (req, res) => {
  const { session_status, session_notes } = req.body;

  try {
    const updates = [];
    const params  = [];

    if (session_status) { updates.push("session_status = ?"); params.push(session_status); }
    if (session_notes)  { updates.push("session_notes = ?");  params.push(session_notes);  }
    if (session_status === "completed") { updates.push("ended_at = NOW()"); }

    if (!updates.length) return res.status(400).json({ error: "Nothing to update" });

    params.push(req.params.id);
    await db.query(`UPDATE sessions SET ${updates.join(", ")} WHERE session_id = ?`, params);

    res.json({ message: "Session updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── GET /api/sessions/:id ─────────────────────────────────────────────────────
router.get("/:id", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, a.student_id, a.counsellor_id, a.scheduled_date
       FROM sessions s JOIN appointments a ON s.appointment_id = a.appointment_id
       WHERE s.session_id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Session not found" });

    const session = rows[0];
    const { user_id, role } = req.user;

    // Only participants and admins can view
    if (role !== "admin" && session.student_id !== user_id && session.counsellor_id !== user_id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
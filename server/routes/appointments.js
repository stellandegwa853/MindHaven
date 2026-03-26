const express   = require("express");
const db        = require("../config/db");
const auth      = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

// ── GET /api/appointments ─────────────────────────────────────────────────────
// Students see their own; counsellors see theirs; admins see all
router.get("/", auth, async (req, res) => {
  const { user_id, role } = req.user;
  try {
    let query, params;
    if (role === "student") {
      query  = "SELECT a.*, u.full_name AS counsellor_name FROM appointments a JOIN users u ON a.counsellor_id = u.user_id WHERE a.student_id = ? ORDER BY a.scheduled_date DESC";
      params = [user_id];
    } else if (role === "counsellor") {
      query  = "SELECT a.*, u.full_name AS student_name FROM appointments a JOIN users u ON a.student_id = u.user_id WHERE a.counsellor_id = ? ORDER BY a.scheduled_date DESC";
      params = [user_id];
    } else {
      query  = "SELECT a.*, s.full_name AS student_name, c.full_name AS counsellor_name FROM appointments a JOIN users s ON a.student_id = s.user_id JOIN users c ON a.counsellor_id = c.user_id ORDER BY a.scheduled_date DESC";
      params = [];
    }
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── POST /api/appointments ────────────────────────────────────────────────────
router.post("/", auth, roleCheck("student"), async (req, res) => {
  const { counsellor_id, scheduled_date, start_time, end_time } = req.body;
  const student_id = req.user.user_id;

  if (!counsellor_id || !scheduled_date || !start_time || !end_time) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check counsellor exists and is verified
    const [counsellor] = await db.query(
      "SELECT user_id FROM users WHERE user_id = ? AND role = 'counsellor' AND is_verified = TRUE AND is_active = TRUE",
      [counsellor_id]
    );
    if (!counsellor.length) {
      return res.status(404).json({ error: "Counsellor not found or not available" });
    }

    const [result] = await db.query(
      "INSERT INTO appointments (student_id, counsellor_id, scheduled_date, start_time, end_time) VALUES (?, ?, ?, ?, ?)",
      [student_id, counsellor_id, scheduled_date, start_time, end_time]
    );

    // Create notification for counsellor
    await db.query(
      "INSERT INTO notifications (user_id, title, body, notif_type, reference_id) VALUES (?, ?, ?, 'appointment', ?)",
      [counsellor_id, "New appointment request", `A student has booked a session on ${scheduled_date} at ${start_time}.`, result.insertId]
    );

    res.status(201).json({ message: "Appointment booked", appointment_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── PATCH /api/appointments/:id ───────────────────────────────────────────────
// Counsellor confirms/cancels; student can cancel
router.patch("/:id", auth, async (req, res) => {
  const { status, cancel_reason } = req.body;
  const { user_id, role } = req.user;

  const allowed = role === "counsellor"
    ? ["confirmed","cancelled"]
    : role === "student"
    ? ["cancelled"]
    : ["confirmed","cancelled","completed"];

  if (!allowed.includes(status)) {
    return res.status(403).json({ error: "You cannot set this status" });
  }

  try {
    const [appt] = await db.query("SELECT * FROM appointments WHERE appointment_id = ?", [req.params.id]);
    if (!appt.length) return res.status(404).json({ error: "Appointment not found" });

    const a = appt[0];
    if (role === "student"     && a.student_id    !== user_id) return res.status(403).json({ error: "Not your appointment" });
    if (role === "counsellor"  && a.counsellor_id !== user_id) return res.status(403).json({ error: "Not your appointment" });

    await db.query(
      "UPDATE appointments SET status = ?, cancel_reason = COALESCE(?, cancel_reason) WHERE appointment_id = ?",
      [status, cancel_reason, req.params.id]
    );

    // Notify the other party
    const notifyUserId  = role === "counsellor" ? a.student_id : a.counsellor_id;
    const notifyMessage = `Your appointment on ${a.scheduled_date} has been ${status}.`;
    await db.query(
      "INSERT INTO notifications (user_id, title, body, notif_type, reference_id) VALUES (?, ?, ?, 'appointment', ?)",
      [notifyUserId, "Appointment update", notifyMessage, req.params.id]
    );

    res.json({ message: `Appointment ${status}` });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
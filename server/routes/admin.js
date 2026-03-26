const express   = require("express");
const db        = require("../config/db");
const auth      = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();
const adminOnly = [auth, roleCheck("admin")];

// ── GET /api/admin/users ──────────────────────────────────────────────────────
router.get("/users", ...adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT user_id, full_name, email, role, is_active, is_verified, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ── PATCH /api/admin/users/:id ────────────────────────────────────────────────
router.patch("/users/:id", ...adminOnly, async (req, res) => {
  const { is_active, is_verified } = req.body;
  try {
    const updates = [];
    const params  = [];
    if (is_active   !== undefined) { updates.push("is_active = ?");   params.push(is_active);   }
    if (is_verified !== undefined) { updates.push("is_verified = ?"); params.push(is_verified); }
    if (!updates.length) return res.status(400).json({ error: "Nothing to update" });

    params.push(req.params.id);
    await db.query(`UPDATE users SET ${updates.join(", ")} WHERE user_id = ?`, params);

    // Log admin action
    await db.query(
      "INSERT INTO audit_logs (actor_id, action, target_type, target_id) VALUES (?, ?, 'user', ?)",
      [req.user.user_id, is_verified ? "VERIFIED_COUNSELLOR" : is_active ? "REINSTATED_USER" : "SUSPENDED_USER", req.params.id]
    );

    res.json({ message: "User updated" });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ── GET /api/admin/risk-flags ─────────────────────────────────────────────────
router.get("/risk-flags", ...adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT rf.*, u.full_name AS student_name
       FROM risk_flags rf JOIN users u ON rf.student_id = u.user_id
       ORDER BY rf.created_at DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ── PATCH /api/admin/risk-flags/:id ──────────────────────────────────────────
router.patch("/risk-flags/:id", ...adminOnly, async (req, res) => {
  const { resolution } = req.body;
  try {
    await db.query(
      "UPDATE risk_flags SET reviewed_by = ?, reviewed_at = NOW(), resolution = ? WHERE flag_id = ?",
      [req.user.user_id, resolution || "Reviewed by admin", req.params.id]
    );
    res.json({ message: "Risk flag reviewed" });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ── GET /api/admin/analytics ──────────────────────────────────────────────────
router.get("/analytics", ...adminOnly, async (req, res) => {
  try {
    const [[totalUsers]]    = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'student'");
    const [[activeCounsellors]] = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'counsellor' AND is_verified = TRUE AND is_active = TRUE");
    const [[pendingCounsellors]] = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'counsellor' AND is_verified = FALSE");
    const [[sessionsMonth]] = await db.query("SELECT COUNT(*) AS count FROM sessions WHERE MONTH(started_at) = MONTH(NOW()) AND YEAR(started_at) = YEAR(NOW())");
    const [[unreviewedFlags]] = await db.query("SELECT COUNT(*) AS count FROM risk_flags WHERE reviewed_at IS NULL");
    const [registrationsByMonth] = await db.query(
      "SELECT DATE_FORMAT(created_at, '%b %Y') AS month, COUNT(*) AS count FROM users WHERE role = 'student' GROUP BY YEAR(created_at), MONTH(created_at) ORDER BY created_at ASC LIMIT 6"
    );
    const [sessionsByWeek] = await db.query(
      "SELECT WEEK(started_at) AS week, COUNT(*) AS count FROM sessions WHERE started_at >= DATE_SUB(NOW(), INTERVAL 8 WEEK) GROUP BY WEEK(started_at) ORDER BY week ASC"
    );
    const [moodDistribution] = await db.query(
      "SELECT mood_score, COUNT(*) AS count FROM mood_tracker WHERE logged_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY mood_score"
    );
    const [riskByMonth] = await db.query(
      "SELECT DATE_FORMAT(created_at, '%b') AS month, risk_level, COUNT(*) AS count FROM risk_flags GROUP BY month, risk_level ORDER BY created_at ASC LIMIT 18"
    );

    res.json({
      summary: {
        totalUsers:          totalUsers.count,
        activeCounsellors:   activeCounsellors.count,
        pendingCounsellors:  pendingCounsellors.count,
        sessionsThisMonth:   sessionsMonth.count,
        unreviewedFlags:     unreviewedFlags.count,
      },
      charts: {
        registrationsByMonth,
        sessionsByWeek,
        moodDistribution,
        riskByMonth,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
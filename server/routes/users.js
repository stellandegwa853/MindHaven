const express   = require("express");
const db        = require("../config/db");
const auth      = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

// ── GET /api/users/profile ────────────────────────────────────────────────────
router.get("/profile", auth, async (req, res) => {
  try {
    const { user_id, role } = req.user;
    const [users] = await db.query(
      "SELECT user_id, full_name, email, role, profile_photo, created_at FROM users WHERE user_id = ?",
      [user_id]
    );
    if (!users.length) return res.status(404).json({ error: "User not found" });

    let profile = users[0];

    if (role === "student") {
      const [sp] = await db.query("SELECT * FROM student_profiles WHERE user_id = ?", [user_id]);
      profile = { ...profile, ...sp[0] };
    } else if (role === "counsellor") {
      const [cp] = await db.query("SELECT * FROM counsellor_profiles WHERE user_id = ?", [user_id]);
      profile = { ...profile, ...cp[0] };
    }

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── PATCH /api/users/profile ──────────────────────────────────────────────────
router.patch("/profile", auth, async (req, res) => {
  const { full_name, profile_photo, bio, department, year_of_study, specialization } = req.body;
  const { user_id, role } = req.user;

  try {
    if (full_name) {
      await db.query("UPDATE users SET full_name = ? WHERE user_id = ?", [full_name, user_id]);
    }
    if (profile_photo) {
      await db.query("UPDATE users SET profile_photo = ? WHERE user_id = ?", [profile_photo, user_id]);
    }
    if (role === "student" && (bio || department || year_of_study)) {
      await db.query(
        "UPDATE student_profiles SET bio = COALESCE(?, bio), department = COALESCE(?, department), year_of_study = COALESCE(?, year_of_study) WHERE user_id = ?",
        [bio, department, year_of_study, user_id]
      );
    }
    if (role === "counsellor" && (bio || specialization)) {
      await db.query(
        "UPDATE counsellor_profiles SET bio = COALESCE(?, bio), specialization = COALESCE(?, specialization) WHERE user_id = ?",
        [bio, specialization, user_id]
      );
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── GET /api/users/counsellors ────────────────────────────────────────────────
// Students use this to see available counsellors when booking
router.get("/counsellors", auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.user_id, u.full_name, u.profile_photo,
             cp.specialization, cp.bio
      FROM users u
      JOIN counsellor_profiles cp ON u.user_id = cp.user_id
      WHERE u.role = 'counsellor'
        AND u.is_active = TRUE
        AND u.is_verified = TRUE
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── GET /api/users/availability/:counsellor_id ────────────────────────────────
router.get("/availability/:counsellor_id", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM counsellor_availability WHERE counsellor_id = ? AND is_active = TRUE ORDER BY FIELD(day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')",
      [req.params.counsellor_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── PUT /api/users/availability ───────────────────────────────────────────────
// Counsellors update their weekly schedule
router.put("/availability", auth, roleCheck("counsellor"), async (req, res) => {
  const { schedule } = req.body; // [{ day_of_week, start_time, end_time, is_active }]
  const { user_id } = req.user;

  try {
    // Delete existing and re-insert
    await db.query("DELETE FROM counsellor_availability WHERE counsellor_id = ?", [user_id]);
    if (schedule && schedule.length > 0) {
      const values = schedule.map((s) => [user_id, s.day_of_week, s.start_time, s.end_time, s.is_active ?? true]);
      await db.query(
        "INSERT INTO counsellor_availability (counsellor_id, day_of_week, start_time, end_time, is_active) VALUES ?",
        [values]
      );
    }
    res.json({ message: "Availability updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
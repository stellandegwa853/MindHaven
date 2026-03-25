const express   = require("express");
const db        = require("../config/db");
const auth      = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const { category } = req.query;
    let query = "SELECT resource_id, title, resource_type, description, content_url, tags, created_at FROM resources WHERE is_published = TRUE";
    const params = [];
    if (category) { query += " AND tags LIKE ?"; params.push(`%${category}%`); }
    query += " ORDER BY created_at DESC";
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", auth, roleCheck("admin"), async (req, res) => {
  const { title, resource_type, description, content_url, content_body, tags } = req.body;
  if (!title || !resource_type) return res.status(400).json({ error: "Title and type are required" });
  try {
    const [result] = await db.query(
      "INSERT INTO resources (title, resource_type, description, content_url, content_body, tags, created_by) VALUES (?,?,?,?,?,?,?)",
      [title, resource_type, description, content_url, content_body, tags, req.user.user_id]
    );
    res.status(201).json({ message: "Resource created", resource_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/:id", auth, roleCheck("admin"), async (req, res) => {
  const { title, description, content_url, tags, is_published } = req.body;
  try {
    await db.query(
      "UPDATE resources SET title=COALESCE(?,title), description=COALESCE(?,description), content_url=COALESCE(?,content_url), tags=COALESCE(?,tags), is_published=COALESCE(?,is_published) WHERE resource_id=?",
      [title, description, content_url, tags, is_published, req.params.id]
    );
    res.json({ message: "Resource updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", auth, roleCheck("admin"), async (req, res) => {
  try {
    await db.query("DELETE FROM resources WHERE resource_id = ?", [req.params.id]);
    res.json({ message: "Resource deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
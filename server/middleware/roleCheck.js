// Usage: router.get("/admin-only", auth, roleCheck("admin"), handler)
// Usage: router.get("/counsellors", auth, roleCheck("counsellor","admin"), handler)

const roleCheck = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: "Access denied — insufficient permissions" });
  }
  next();
};

module.exports = roleCheck;
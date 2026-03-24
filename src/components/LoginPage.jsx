import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("student");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // Try real API first
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        login(data.user, data.token);
        redirectByRole(data.user.role);
        return;
      }
    } catch (err) {
      // Backend not running — use demo mode
      console.warn("Backend unavailable, using demo mode");
    }

    // Demo mode fallback (for presentation without backend)
    const demoUser = { user_id: 1, full_name: "Demo User", email, role };
    login(demoUser, "demo-token");
    redirectByRole(role);
    setLoading(false);
  };

  const redirectByRole = (r) => {
    if (r === "student" || r === "user") navigate("/dashboard");
    else if (r === "counsellor") navigate("/counsellor-dashboard");
    else if (r === "admin") navigate("/admin");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Mind Haven</h1>
        <p style={styles.subtitle}>Login to continue</p>

        {error && <p style={styles.error}>{error}</p>}

        <label style={styles.label}>Email</label>
        <input
          style={styles.input}
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <label style={styles.label}>Password</label>
        <input
          style={styles.input}
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <label style={styles.label}>Login As</label>
        <select
          style={styles.input}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">Student</option>
          <option value="counsellor">Counsellor</option>
          <option value="admin">Admin</option>
        </select>

        <button
          style={loading ? styles.buttonDisabled : styles.button}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={styles.linkText}>
          Don't have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/signup")}>
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex", justifyContent: "center", alignItems: "center",
    height: "100vh", backgroundColor: "#f3f4f6", fontFamily: "Arial, sans-serif",
  },
  card: {
    backgroundColor: "white", padding: "40px", borderRadius: "12px",
    width: "350px", boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
  },
  title:    { marginBottom: "10px", textAlign: "center" },
  subtitle: { marginBottom: "20px", textAlign: "center", color: "#6b7280" },
  error:    { color: "#dc2626", fontSize: "13px", marginBottom: "10px", textAlign: "center" },
  label:    { display: "block", marginTop: "15px", marginBottom: "5px", fontSize: "13px", color: "#374151" },
  input:    { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", boxSizing: "border-box", fontSize: "13px", outline: "none" },
  button:   { marginTop: "20px", width: "100%", padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "14px" },
  buttonDisabled: { marginTop: "20px", width: "100%", padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#c7d2fe", color: "white", cursor: "not-allowed", fontSize: "14px" },
  linkText: { marginTop: "16px", textAlign: "center", fontSize: "13px", color: "#6b7280" },
  link:     { color: "#818cf8", cursor: "pointer", fontWeight: "500" },
};

export default LoginPage;
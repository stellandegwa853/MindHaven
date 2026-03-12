import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../utils/auth";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    let role = "user";

    if (email.toLowerCase().includes("counsellor")) {
      role = "counsellor";
    }

    loginUser(role);

    if (role === "counsellor") {
      navigate("/counsellor-dashboard");
    } else {
      navigate("/user-dashboard");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Mind Haven</h1>
        <p style={styles.subtitle}>
          A safe space for peer support
        </p>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Log In
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{" "}
          <Link to="/signup" style={styles.link}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
    fontFamily: "Arial, sans-serif"
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "12px",
    width: "350px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.05)",
    textAlign: "center"
  },
  title: {
    marginBottom: "5px",
    fontSize: "24px",
    fontWeight: "600",
    color: "#1f2937"
  },
  subtitle: {
    marginBottom: "25px",
    fontSize: "14px",
    color: "#6b7280"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px"
  },
  button: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#1f2937",
    color: "white",
    cursor: "pointer",
    fontWeight: "500"
  },
  footerText: {
    marginTop: "20px",
    fontSize: "13px",
    color: "#6b7280"
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "500"
  }
};

export default LoginPage;
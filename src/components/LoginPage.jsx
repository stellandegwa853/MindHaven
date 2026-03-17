import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../utils/auth";

function LoginPage() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const handleLogin = () => {

    loginUser(role);

    if (role === "user") {
      navigate("/dashboard");
    }

    if (role === "counsellor") {
      navigate("/counsellor-dashboard");
    }

    if (role === "admin") {
      navigate("/admin");
    }
  };

  return (
    <div style={styles.container}>

      <div style={styles.card}>

        <h1 style={styles.title}>Mind Haven</h1>
        <p style={styles.subtitle}>Login to continue</p>

        <label style={styles.label}>Email</label>
        <input
          style={styles.input}
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label style={styles.label}>Password</label>
        <input
          style={styles.input}
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label style={styles.label}>Login As</label>
        <select
          style={styles.input}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="counsellor">Counsellor</option>
          <option value="admin">Admin</option>
        </select>

        <button style={styles.button} onClick={handleLogin}>
          Login
        </button>

      </div>

    </div>
  );
}

const styles = {

  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f3f4f6",
    fontFamily: "Arial, sans-serif"
  },

  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "12px",
    width: "350px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.05)"
  },

  title: {
    marginBottom: "10px",
    textAlign: "center"
  },

  subtitle: {
    marginBottom: "20px",
    textAlign: "center",
    color: "#6b7280"
  },

  label: {
    display: "block",
    marginTop: "15px",
    marginBottom: "5px"
  },

  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb"
  },

  button: {
    marginTop: "20px",
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#818cf8",
    color: "white",
    cursor: "pointer"
  }

};

export default LoginPage;
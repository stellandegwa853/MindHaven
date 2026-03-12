import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../utils/auth";

function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const handleSignUp = () => {
    if (!name || !email || !password || !role) {
      alert("Please fill in all fields.");
      return;
    }

    loginUser(role);

    if (role === "user") {
      navigate("/user-dashboard");
    } else {
      navigate("/counsellor-dashboard");
    }
  };

  return (
    <div className="card">
      <h1 className="title">Create Account</h1>

      <div className="form-group">
        <input
          type="text"
          placeholder="Full Name"
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <input
          type="email"
          placeholder="Email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="form-group">
        <select
          className="input-field"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select Role</option>
          <option value="user">User</option>
          <option value="counsellor">Peer Counsellor</option>
        </select>
      </div>

      <button className="btn-primary full-width" onClick={handleSignUp}>
        Create Account
      </button>

      <p className="link-text" onClick={() => navigate("/")}>
        Back to Home
      </p>
    </div>
  );
}

export default SignUpPage;
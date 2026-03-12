import React from "react";
import { useNavigate } from "react-router-dom";

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="card">
      <h1 className="title">Mind Haven</h1>
      <p className="subtitle">
        A safe and supportive space for mental wellness.
      </p>

      <div className="button-group">
        <button
          className="btn-primary"
          onClick={() => navigate("/login")}
        >
          Login
        </button>

        <button
          className="btn-secondary"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default WelcomePage;
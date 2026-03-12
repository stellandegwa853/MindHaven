import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="card">
      <h1 className="title">Dashboard</h1>
      <p className="subtitle">
        Welcome to your mental wellness space.
      </p>

      <button
        className="btn-secondary full-width"
        onClick={() => navigate("/")}
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
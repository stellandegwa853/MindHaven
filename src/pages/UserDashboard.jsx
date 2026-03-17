import React from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/auth";

function UserDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>Mind Haven</h2>

        <button
          style={styles.navButton}
          onClick={() => navigate("/chat")}
        >
          Start Chat
        </button>

        <button
          style={styles.navButton}
          onClick={() => navigate("/resources")}
        >
          Resources
        </button>

        <button style={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <h1 style={styles.title}>Welcome Back</h1>

        {/* Start Session Card */}
        <div style={styles.card}>
          <h3>Need Support Right Now?</h3>
          <p>
            Connect instantly with a verified peer counsellor in a safe and supportive environment.
          </p>
          <button
            style={styles.primaryButton}
            onClick={() => navigate("/chat")}
          >
            Start Peer Session
          </button>
        </div>

        {/* Session History */}
        <div style={styles.section}>
          <h3>Previous Sessions</h3>
          <div style={styles.sessionItem}>
            <span>02 March 2026</span>
            <span>25 mins</span>
            <span style={styles.completed}>Completed</span>
          </div>
          <div style={styles.sessionItem}>
            <span>27 February 2026</span>
            <span>18 mins</span>
            <span style={styles.completed}>Completed</span>
          </div>
        </div>

        {/* Resources */}
        <div style={styles.section}>
          <h3>Wellness Resources</h3>
          <div style={styles.resourceButtons}>
            <button style={styles.resourceButton}>Breathing Exercises</button>
            <button style={styles.resourceButton}>Self-Care Guide</button>
            <button style={styles.resourceButton}>Crisis Support Contacts</button>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial, sans-serif"
  },

  sidebar: {
    width: "240px",
    backgroundColor: "#111827",
    color: "white",
    display: "flex",
    flexDirection: "column",
    padding: "25px 20px",
    gap: "20px"
  },

  logo: {
    fontSize: "20px",
    marginBottom: "30px"
  },

  navButton: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#818cf8",
    color: "white",
    cursor: "pointer",
    textAlign: "left"
  },

  logoutButton: {
    marginTop: "auto",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #4b5563",
    backgroundColor: "transparent",
    color: "white",
    cursor: "pointer"
  },

  mainContent: {
    flex: 1,
    padding: "40px",
    backgroundColor: "#f3f4f6",
    overflowY: "auto"
  },

  title: {
    marginBottom: "30px"
  },

  card: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
    maxWidth: "500px",
    marginBottom: "40px"
  },

  primaryButton: {
    marginTop: "15px",
    padding: "10px 15px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#818cf8",
    color: "white",
    cursor: "pointer"
  },

  section: {
    marginBottom: "40px",
    maxWidth: "600px"
  },

  sessionItem: {
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: "12px 15px",
    borderRadius: "8px",
    marginTop: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.03)"
  },

  completed: {
    color: "#16a34a",
    fontWeight: "bold"
  },

  resourceButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "10px"
  },

  resourceButton: {
    padding: "10px 15px",
    borderRadius: "8px",
    border: "1px solid #818cf8",
    backgroundColor: "white",
    cursor: "pointer"
  }
};

export default UserDashboard;
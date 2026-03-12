import React from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/auth";

function CounsellorDashboard() {
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
          onClick={() => navigate("/counsellor-chat")}
        >
          Active Session
        </button>

        <button style={styles.navButton}>
          Session Requests
        </button>

        <button style={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <h1 style={styles.title}>Counsellor Workspace</h1>

        {/* Summary Cards */}
        <div style={styles.cardContainer}>
          <div style={styles.summaryCard}>
            <h3>Sessions Today</h3>
            <p style={styles.cardNumber}>3</p>
          </div>

          <div style={styles.summaryCard}>
            <h3>Active Sessions</h3>
            <p style={styles.cardNumber}>1</p>
          </div>

          <div style={styles.summaryCard}>
            <h3>Total Sessions</h3>
            <p style={styles.cardNumber}>18</p>
          </div>
        </div>

        {/* Active Client Section */}
        <div style={styles.section}>
          <h3>Active Client</h3>
          <div style={styles.clientCard}>
            <div>
              <p style={{ margin: 0, fontWeight: "600" }}>
                Anonymous Client
              </p>
              <p style={{ margin: "5px 0", fontSize: "14px", color: "#6b7280" }}>
                Status: Waiting
              </p>
            </div>

            <button
              style={styles.primaryButton}
              onClick={() => navigate("/counsellor-chat")}
            >
              Join Session
            </button>
          </div>
        </div>

        {/* Recent Sessions */}
        <div style={styles.section}>
          <h3>Recent Sessions</h3>

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

  cardContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "40px",
    flexWrap: "wrap"
  },

  summaryCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
    minWidth: "180px"
  },

  cardNumber: {
    fontSize: "24px",
    fontWeight: "bold",
    marginTop: "10px",
    color: "#818cf8"
  },

  section: {
    marginBottom: "40px",
    maxWidth: "700px"
  },

  clientCard: {
    backgroundColor: "white",
    padding: "15px 20px",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.03)"
  },

  primaryButton: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#818cf8",
    color: "white",
    cursor: "pointer"
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
  }
};

export default CounsellorDashboard;
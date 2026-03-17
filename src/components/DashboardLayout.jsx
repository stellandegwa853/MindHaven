import React from "react";
import { useNavigate } from "react-router-dom";

function DashboardLayout({ children }) {

  const navigate = useNavigate();

  return (
    <div style={styles.container}>

      <div style={styles.sidebar}>

        <h2 style={styles.logo}>Mind Haven</h2>

        <button style={styles.navButton} onClick={() => navigate("/dashboard")}>
          Dashboard
        </button>

        <button style={styles.navButton} onClick={() => navigate("/chat")}>
          Chat
        </button>

        <button style={styles.navButton} onClick={() => navigate("/resources")}>
          Resources
        </button>

        <button style={styles.navButton} onClick={() => navigate("/session-history")}>
          Session History
        </button>

        <button style={styles.navButton} onClick={() => navigate("/profile")}>
          Profile
        </button>

      </div>

      <div style={styles.content}>
        {children}
      </div>

    </div>
  );
}

const styles = {

  container: {
    display: "flex",
    minHeight: "100vh"
  },

  sidebar: {
    width: "220px",
    backgroundColor: "white",
    padding: "20px",
    borderRight: "1px solid #e5e7eb"
  },

  logo: {
    marginBottom: "30px"
  },

  navButton: {
    display: "block",
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    border: "none",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    cursor: "pointer"
  },

  content: {
    flex: 1,
    padding: "40px",
    backgroundColor: "#f9fafb"
  }

};

export default DashboardLayout;
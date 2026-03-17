import React, { useState } from "react";

function Profile() {

  const [name, setName] = useState("Anonymous User");
  const [email, setEmail] = useState("user@email.com");
  const [topic, setTopic] = useState("Stress");

  const handleSave = () => {
    alert("Profile updated successfully!");
  };

  return (
    <div style={styles.container}>

      <h1 style={styles.title}>My Profile</h1>
      <p style={styles.subtitle}>
        Manage your personal information and preferences.
      </p>

      <div style={styles.card}>

        <label style={styles.label}>Display Name</label>
        <input
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label style={styles.label}>Email</label>
        <input
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label style={styles.label}>Preferred Counselling Topic</label>
        <select
          style={styles.input}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option>Stress</option>
          <option>Anxiety</option>
          <option>Academic Burnout</option>
          <option>Relationships</option>
        </select>

        <button style={styles.button} onClick={handleSave}>
          Save Changes
        </button>

      </div>

    </div>
  );
}

const styles = {

  container: {
    padding: "40px",
    backgroundColor: "#f3f4f6",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif"
  },

  title: {
    marginBottom: "10px"
  },

  subtitle: {
    marginBottom: "30px",
    color: "#6b7280"
  },

  card: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "400px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.05)"
  },

  label: {
    display: "block",
    marginBottom: "6px",
    marginTop: "15px",
    fontWeight: "500"
  },

  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb"
  },

  button: {
    marginTop: "20px",
    padding: "10px",
    width: "100%",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#818cf8",
    color: "white",
    cursor: "pointer"
  }

};

export default Profile;
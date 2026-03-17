import React from "react";

function Resources() {
  const resources = [
    {
      title: "Stress Management",
      description: "Learn simple techniques to manage daily stress and maintain emotional balance."
    },
    {
      title: "Anxiety Support",
      description: "Helpful tips for recognizing and managing anxiety in everyday life."
    },
    {
      title: "Study Burnout",
      description: "Strategies to avoid academic burnout and maintain healthy study habits."
    },
    {
      title: "Crisis Support",
      description: "Information on where to seek immediate help when facing a mental health crisis."
    }
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Mental Health Resources</h1>
      <p style={styles.subtitle}>
        Explore helpful guides and support materials to improve your well-being.
      </p>

      <div style={styles.grid}>
        {resources.map((resource, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.icon}>{resource.icon}</div>
            <h3>{resource.title}</h3>
            <p style={styles.description}>{resource.description}</p>
            <button style={styles.button}>Learn More</button>
          </div>
        ))}
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

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px"
  },

  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
    textAlign: "center"
  },

  icon: {
    fontSize: "30px",
    marginBottom: "10px"
  },

  description: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "15px"
  },

  button: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#818cf8",
    color: "white",
    cursor: "pointer"
  }
};

export default Resources;
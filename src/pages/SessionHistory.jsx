import React from "react";

function SessionHistory() {

  const sessions = [
    {
      date: "05 Mar 2026",
      duration: "25 mins",
      counsellor: "Peer Counsellor",
      status: "Completed"
    },
    {
      date: "01 Mar 2026",
      duration: "18 mins",
      counsellor: "Peer Counsellor",
      status: "Completed"
    },
    {
      date: "24 Feb 2026",
      duration: "30 mins",
      counsellor: "Peer Counsellor",
      status: "Completed"
    }
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Session History</h1>
      <p style={styles.subtitle}>
        View your previous counselling sessions.
      </p>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Duration</th>
              <th>Counsellor</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {sessions.map((session, index) => (
              <tr key={index} style={styles.row}>
                <td>{session.date}</td>
                <td>{session.duration}</td>
                <td>{session.counsellor}</td>
                <td style={styles.status}>{session.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

  tableContainer: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.05)"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  },

  row: {
    borderTop: "1px solid #e5e7eb"
  },

  status: {
    color: "#16a34a",
    fontWeight: "bold"
  }

};

export default SessionHistory;
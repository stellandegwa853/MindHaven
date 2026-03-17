import DashboardLayout from "../components/DashboardLayout";

function AdminDashboard() {
  return (
    <DashboardLayout>

      <h1 style={{ marginBottom: "30px" }}>Admin Workspace</h1>

      <div style={styles.cards}>

        <div style={styles.card}>
          <h3>Total Users</h3>
          <p style={styles.number}>24</p>
        </div>

        <div style={styles.card}>
          <h3>Total Counsellors</h3>
          <p style={styles.number}>5</p>
        </div>

        <div style={styles.card}>
          <h3>Active Sessions</h3>
          <p style={styles.number}>3</p>
        </div>

      </div>

      <h2 style={{ marginTop: "40px" }}>Platform Users</h2>

      <div style={styles.table}>

        <div style={styles.rowHeader}>
          <span>Name</span>
          <span>Role</span>
        </div>

        <div style={styles.row}>
          <span>Alice</span>
          <span>User</span>
        </div>

        <div style={styles.row}>
          <span>Brian</span>
          <span>User</span>
        </div>

        <div style={styles.row}>
          <span>Clara</span>
          <span>Counsellor</span>
        </div>

        <div style={styles.row}>
          <span>David</span>
          <span>User</span>
        </div>

      </div>

    </DashboardLayout>
  );
}

const styles = {

  cards:{
    display:"flex",
    gap:"20px",
    marginBottom:"20px"
  },

  card:{
    background:"white",
    padding:"20px",
    borderRadius:"10px",
    width:"220px",
    boxShadow:"0 4px 10px rgba(0,0,0,0.05)"
  },

  number:{
    fontSize:"28px",
    fontWeight:"bold",
    color:"#7a83eb"
  },

  table:{
    background:"white",
    padding:"20px",
    borderRadius:"10px",
    boxShadow:"0 4px 10px rgba(0,0,0,0.05)"
  },

  rowHeader:{
    display:"flex",
    justifyContent:"space-between",
    fontWeight:"bold",
    marginBottom:"10px"
  },

  row:{
    display:"flex",
    justifyContent:"space-between",
    padding:"8px 0",
    borderTop:"1px solid #eee"
  }

};

export default AdminDashboard;
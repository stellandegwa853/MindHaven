import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Usage: <ProtectedRoute allowedRoles={["student"]}><UserDashboard /></ProtectedRoute>
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to correct dashboard based on role
    if (user.role === "admin")      return <Navigate to="/admin"                replace />;
    if (user.role === "counsellor") return <Navigate to="/counsellor-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

const styles = {
  loadingScreen: {
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "100vh", backgroundColor: "#f3f4f6",
  },
  loadingText: { fontSize: "16px", color: "#6b7280" },
};

export default ProtectedRoute;
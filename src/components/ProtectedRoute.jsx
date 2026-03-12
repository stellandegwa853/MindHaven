import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../utils/auth";

function ProtectedRoute({ children, allowedRole }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  const role = getUserRole();

  if (allowedRole && role !== allowedRole) {
    // Redirect to correct dashboard
    if (role === "user") {
      return <Navigate to="/user-dashboard" />;
    }
    if (role === "counsellor") {
      return <Navigate to="/counsellor-dashboard" />;
    }
  }

  return children;
}

export default ProtectedRoute;
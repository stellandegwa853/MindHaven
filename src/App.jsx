import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import LoginPage           from "./components/LoginPage";
import SignUpPage          from "./components/SignUpPage";
import ProtectedRoute      from "./components/ProtectedRoute";
import UserDashboard       from "./pages/UserDashboard";
import CounsellorDashboard from "./components/CounsellorDashboard";
import AdminDashboard      from "./pages/AdminDashboard";
import ChatPage            from "./components/ChatPage";
import CounsellorChatPage  from "./components/CounsellorChatPage";
import Resources           from "./pages/Resources";
import Journal             from "./pages/Journal";
import SessionHistory      from "./pages/SessionHistory";
import Profile             from "./pages/Profile";
import AppointmentBooking from "./pages/AppointmentBooking";
import AIChatBot from "./pages/AIChatBot";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/"       element={<LoginPage />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Student */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["student", "user"]}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute allowedRoles={["student", "user"]}>
              <ChatPage />
            </ProtectedRoute>
          } />
          <Route path="/resources" element={
            <ProtectedRoute allowedRoles={["student", "user"]}>
              <Resources />
            </ProtectedRoute>
          } />
          <Route path="/journal" element={
            <ProtectedRoute allowedRoles={["student", "user"]}>
              <Journal />
            </ProtectedRoute>
          } />
          <Route path="/session-history" element={
            <ProtectedRoute allowedRoles={["student", "user"]}>
              <SessionHistory />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={["student", "user", "counsellor", "admin"]}>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Counsellor */}
          <Route path="/counsellor-dashboard" element={
            <ProtectedRoute allowedRoles={["counsellor"]}>
              <CounsellorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/counsellor-chat" element={
            <ProtectedRoute allowedRoles={["counsellor"]}>
              <CounsellorChatPage />
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/appointments" element={
            <ProtectedRoute allowedRoles={["student", "user"]}>
              <AppointmentBooking />
            </ProtectedRoute>
          } />

          <Route path="/ai-chat" element={
            <ProtectedRoute allowedRoles={["student", "user"]}>
              <AIChatBot />
           </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
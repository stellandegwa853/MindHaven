import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import UserDashboard from "./pages/UserDashboard";
import CounsellorDashboard from "./components/CounsellorDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatPage from "./components/ChatPage";
import CounsellorChatPage from "./components/CounsellorChatPage";
import Resources from "./pages/Resources";
import SessionHistory from "./pages/SessionHistory";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/session-history" element={<SessionHistory />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/counsellor-dashboard"
          element={
            <ProtectedRoute allowedRole="counsellor">
              <CounsellorDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/chat"
          element={
            <ProtectedRoute allowedRole="user">
              <ChatPage />
            </ProtectedRoute>
        }
        />

        <Route
          path="/counsellor-chat"
          element={
            <ProtectedRoute allowedRole="counsellor">
              <CounsellorChatPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
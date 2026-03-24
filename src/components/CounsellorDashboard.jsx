import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../utils/auth";

function CounsellorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const counsellorName = "Faith"; // replace with auth context

  const [available, setAvailable] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeSessionNote, setActiveSessionNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const [schedule, setSchedule] = useState({
    Monday:    { enabled: true,  start: "09:00", end: "12:00" },
    Tuesday:   { enabled: false, start: "09:00", end: "12:00" },
    Wednesday: { enabled: true,  start: "14:00", end: "17:00" },
    Thursday:  { enabled: false, start: "09:00", end: "12:00" },
    Friday:    { enabled: true,  start: "10:00", end: "13:00" },
  });

  const notifications = [
    { id: 1, text: "New session request from a student — 10:00 AM today.", unread: true },
    { id: 2, text: "Risk flag raised: a student's message was flagged medium risk.", unread: true },
    { id: 3, text: "Your availability was updated successfully.", unread: false },
  ];
  const unreadCount = notifications.filter((n) => n.unread).length;

  const riskFlags = [
    { id: 1, label: "Student A", message: "Flagged message in session", level: "high",   date: "14 Mar 2026" },
    { id: 2, label: "Student B", message: "Journal entry flagged",       level: "medium", date: "12 Mar 2026" },
  ];

  const sessionHistory = [
    { date: "02 Mar 2026", duration: "25 mins", status: "completed" },
    { date: "27 Feb 2026", duration: "18 mins", status: "completed" },
    { date: "20 Feb 2026", duration: "30 mins", status: "completed" },
    { date: "14 Feb 2026", duration: "22 mins", status: "completed" },
    { date: "07 Feb 2026", duration: "15 mins", status: "completed" },
    { date: "31 Jan 2026", duration: "28 mins", status: "completed" },
  ];

  // Simple bar chart data — sessions per month
  const chartData = [
    { month: "Oct", count: 3 },
    { month: "Nov", count: 5 },
    { month: "Dec", count: 4 },
    { month: "Jan", count: 7 },
    { month: "Feb", count: 6 },
    { month: "Mar", count: 4 },
  ];
  const maxCount = Math.max(...chartData.map((d) => d.count));

  const navItems = [
    { label: "Dashboard",    path: "/counsellor-dashboard" },
    { label: "Active Session", path: "/counsellor-chat" },
    { label: "My Clients",   path: "/counsellor-clients" },
  ];

  const toggleDay = (day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const updateTime = (day, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSaveNote = () => {
    if (!activeSessionNote.trim()) return;
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
    // TODO: POST /api/sessions/:id/notes { notes: activeSessionNote }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div style={styles.container}>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>Mind Haven</h2>

        {navItems.map((item) => (
          <button
            key={item.path}
            style={location.pathname === item.path ? styles.navButtonActive : styles.navButton}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}

        {/* Availability toggle in sidebar */}
        <div style={styles.availabilityToggle}>
          <span style={styles.availLabel}>Available</span>
          <div
            style={{ ...styles.toggleTrack, backgroundColor: available ? "#818cf8" : "#d1d5db" }}
            onClick={() => setAvailable(!available)}
          >
            <div style={{ ...styles.toggleThumb, transform: available ? "translateX(20px)" : "translateX(2px)" }} />
          </div>
        </div>

        <button style={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>

        {/* Topbar */}
        <div style={styles.topbar}>
          <div>
            <h1 style={styles.title}>Counsellor Workspace</h1>
            <p style={styles.subtitle}>Welcome back, {counsellorName}</p>
          </div>
          <div style={styles.topbarRight}>
            <span style={available ? styles.statusOnline : styles.statusOffline}>
              {available ? "● Available" : "○ Unavailable"}
            </span>
            <div style={styles.notifWrapper}>
              <button style={styles.notifButton} onClick={() => setNotifOpen(!notifOpen)}>
                🔔
                {unreadCount > 0 && <span style={styles.notifBadge}>{unreadCount}</span>}
              </button>
              {notifOpen && (
                <div style={styles.notifDropdown}>
                  <p style={styles.notifHeader}>Notifications</p>
                  {notifications.map((n) => (
                    <div key={n.id} style={{ ...styles.notifItem, backgroundColor: n.unread ? "#ede9fe" : "white" }}>
                      <p style={styles.notifText}>{n.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={styles.cardContainer}>
          {[
            { label: "Sessions Today", value: "3" },
            { label: "Active Sessions", value: "1" },
            { label: "Total Sessions", value: "18" },
            { label: "Avg Duration", value: "23m" },
          ].map((c) => (
            <div key={c.label} style={styles.summaryCard}>
              <h3 style={styles.summaryCardTitle}>{c.label}</h3>
              <p style={styles.cardNumber}>{c.value}</p>
            </div>
          ))}
        </div>

        <div style={styles.twoColRow}>

          {/* Left column */}
          <div style={{ flex: 1.2, display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Risk Flag Alerts */}
            {riskFlags.length > 0 && (
              <div style={styles.riskSection}>
                <p style={styles.riskHeader}>⚠ Student risk flags requiring attention</p>
                {riskFlags.map((f) => (
                  <div key={f.id} style={styles.riskRow}>
                    <div>
                      <p style={styles.riskLabel}>{f.label}</p>
                      <p style={styles.riskMeta}>{f.message} · {f.date}</p>
                    </div>
                    <div style={styles.riskRight}>
                      <span style={f.level === "high" ? styles.badgeHigh : styles.badgeMedium}>
                        {f.level}
                      </span>
                      <button style={styles.smallButton}>Review</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active Client + Session Notes */}
            <div style={styles.card}>
              <p style={styles.cardLabel}>Active client</p>
              <div style={styles.clientRow}>
                <div>
                  <p style={styles.clientName}>Anonymous Client</p>
                  <p style={styles.clientMeta}>Status: Waiting</p>
                </div>
                <button style={styles.primaryButton} onClick={() => navigate("/counsellor-chat")}>
                  Join Session
                </button>
              </div>

              <div style={styles.divider} />

              <p style={styles.cardLabel}>Session notes</p>
              <textarea
                style={styles.notesInput}
                rows={3}
                placeholder="Write private session notes here..."
                value={activeSessionNote}
                onChange={(e) => { setActiveSessionNote(e.target.value); setNoteSaved(false); }}
              />
              {noteSaved ? (
                <p style={styles.savedText}>✓ Notes saved</p>
              ) : (
                <button
                  style={activeSessionNote.trim() ? styles.outlineButton : styles.disabledButton}
                  onClick={handleSaveNote}
                >
                  Save Notes
                </button>
              )}
            </div>

            {/* Recent Sessions */}
            <div style={styles.card}>
              <p style={styles.cardLabel}>Recent sessions</p>
              {sessionHistory.slice(0, 4).map((s, i) => (
                <div key={i} style={styles.sessionItem}>
                  <span style={{ fontSize: "13px" }}>{s.date}</span>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>{s.duration}</span>
                  <span style={styles.completedBadge}>Completed</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Performance Chart */}
            <div style={styles.card}>
              <p style={styles.cardLabel}>Sessions per month</p>
              <div style={styles.chartArea}>
                {chartData.map((d) => (
                  <div key={d.month} style={styles.chartCol}>
                    <span style={styles.chartCount}>{d.count}</span>
                    <div style={styles.chartBarTrack}>
                      <div
                        style={{
                          ...styles.chartBar,
                          height: `${(d.count / maxCount) * 100}%`,
                        }}
                      />
                    </div>
                    <span style={styles.chartMonth}>{d.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability Schedule */}
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                <p style={styles.cardLabel}>Availability schedule</p>
                <button style={styles.smallButton} onClick={() => setScheduleOpen(!scheduleOpen)}>
                  {scheduleOpen ? "Done" : "Edit"}
                </button>
              </div>
              {Object.entries(schedule).map(([day, slot]) => (
                <div key={day} style={styles.scheduleRow}>
                  <div style={styles.scheduleLeft}>
                    <div
                      style={{ ...styles.dayToggle, backgroundColor: slot.enabled ? "#818cf8" : "#e5e7eb" }}
                      onClick={() => toggleDay(day)}
                    >
                      <div style={{ ...styles.dayThumb, transform: slot.enabled ? "translateX(16px)" : "translateX(2px)" }} />
                    </div>
                    <span style={{ ...styles.dayLabel, color: slot.enabled ? "#111827" : "#9ca3af" }}>
                      {day.slice(0, 3)}
                    </span>
                  </div>
                  {slot.enabled && scheduleOpen ? (
                    <div style={styles.timeInputs}>
                      <input
                        type="time"
                        style={styles.timeInput}
                        value={slot.start}
                        onChange={(e) => updateTime(day, "start", e.target.value)}
                      />
                      <span style={{ fontSize: "11px", color: "#9ca3af" }}>to</span>
                      <input
                        type="time"
                        style={styles.timeInput}
                        value={slot.end}
                        onChange={(e) => updateTime(day, "end", e.target.value)}
                      />
                    </div>
                  ) : slot.enabled ? (
                    <span style={styles.timeDisplay}>{slot.start} – {slot.end}</span>
                  ) : (
                    <span style={styles.offLabel}>Off</span>
                  )}
                </div>
              ))}
              {scheduleOpen && (
                <button style={{ ...styles.primaryButton, marginTop: "12px", width: "100%" }}>
                  Save Schedule
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" },

  sidebar: {
    width: "240px", backgroundColor: "#111827", color: "white",
    display: "flex", flexDirection: "column", padding: "25px 20px", gap: "10px",
  },
  logo: { fontSize: "20px", marginBottom: "20px" },
  navButton: {
    padding: "10px", borderRadius: "8px", border: "none",
    backgroundColor: "transparent", color: "#9ca3af",
    cursor: "pointer", textAlign: "left", fontSize: "14px",
  },
  navButtonActive: {
    padding: "10px", borderRadius: "8px", border: "none",
    backgroundColor: "#818cf8", color: "white",
    cursor: "pointer", textAlign: "left", fontSize: "14px",
  },
  availabilityToggle: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "10px", borderRadius: "8px",
    backgroundColor: "#1f2937", marginTop: "8px",
  },
  availLabel: { fontSize: "13px", color: "#d1d5db" },
  toggleTrack: {
    width: "42px", height: "24px", borderRadius: "12px",
    position: "relative", cursor: "pointer", transition: "background-color 0.2s",
  },
  toggleThumb: {
    position: "absolute", top: "3px", width: "18px", height: "18px",
    borderRadius: "50%", backgroundColor: "white", transition: "transform 0.2s",
  },
  logoutButton: {
    marginTop: "auto", padding: "10px", borderRadius: "8px",
    border: "1px solid #4b5563", backgroundColor: "transparent",
    color: "white", cursor: "pointer",
  },

  mainContent: { flex: 1, padding: "32px 40px", backgroundColor: "#f3f4f6", overflowY: "auto" },

  topbar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  title: { margin: "0 0 4px", fontSize: "22px", fontWeight: "bold" },
  subtitle: { margin: 0, fontSize: "13px", color: "#6b7280" },
  topbarRight: { display: "flex", alignItems: "center", gap: "14px" },
  statusOnline: { fontSize: "12px", color: "#16a34a", fontWeight: "500", backgroundColor: "#dcfce7", padding: "5px 10px", borderRadius: "20px" },
  statusOffline: { fontSize: "12px", color: "#6b7280", fontWeight: "500", backgroundColor: "#f3f4f6", padding: "5px 10px", borderRadius: "20px", border: "1px solid #e5e7eb" },

  notifWrapper: { position: "relative" },
  notifButton: {
    position: "relative", background: "white", border: "1px solid #e5e7eb",
    borderRadius: "10px", padding: "8px 12px", cursor: "pointer", fontSize: "18px",
  },
  notifBadge: {
    position: "absolute", top: "-6px", right: "-6px",
    backgroundColor: "#818cf8", color: "white", borderRadius: "50%",
    fontSize: "10px", width: "18px", height: "18px",
    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold",
  },
  notifDropdown: {
    position: "absolute", right: 0, top: "44px", width: "300px",
    backgroundColor: "white", borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100, overflow: "hidden",
  },
  notifHeader: { margin: 0, padding: "12px 16px", fontWeight: "600", fontSize: "13px", borderBottom: "1px solid #f3f4f6" },
  notifItem: { padding: "10px 16px", borderBottom: "1px solid #f9fafb" },
  notifText: { margin: 0, fontSize: "13px", color: "#374151" },

  cardContainer: { display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" },
  summaryCard: {
    backgroundColor: "white", padding: "18px 22px", borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)", flex: 1, minWidth: "130px",
  },
  summaryCardTitle: { fontSize: "12px", color: "#6b7280", margin: "0 0 6px", fontWeight: "500" },
  cardNumber: { fontSize: "26px", fontWeight: "bold", margin: 0, color: "#818cf8" },

  twoColRow: { display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" },

  riskSection: {
    backgroundColor: "#fff7ed", border: "1px solid #fed7aa",
    borderRadius: "12px", padding: "16px",
  },
  riskHeader: { margin: "0 0 12px", fontSize: "13px", fontWeight: "600", color: "#c2410c" },
  riskRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "white", padding: "10px 14px", borderRadius: "8px",
    marginBottom: "8px", borderLeft: "3px solid #f97316",
  },
  riskLabel: { margin: 0, fontWeight: "600", fontSize: "13px" },
  riskMeta: { margin: "3px 0 0", fontSize: "12px", color: "#6b7280" },
  riskRight: { display: "flex", gap: "8px", alignItems: "center" },

  card: {
    backgroundColor: "white", padding: "18px 20px",
    borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  cardLabel: { margin: "0 0 12px", fontSize: "13px", fontWeight: "600", color: "#374151" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },

  clientRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  clientName: { margin: "0 0 3px", fontWeight: "600", fontSize: "14px" },
  clientMeta: { margin: 0, fontSize: "12px", color: "#6b7280" },

  divider: { borderTop: "1px solid #f3f4f6", margin: "14px 0" },

  notesInput: {
    width: "100%", borderRadius: "8px", border: "1px solid #e5e7eb",
    padding: "10px 12px", fontSize: "13px", resize: "vertical",
    fontFamily: "Arial, sans-serif", marginBottom: "10px",
    boxSizing: "border-box", outline: "none",
  },

  sessionItem: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 0", borderBottom: "1px solid #f3f4f6",
  },
  completedBadge: {
    padding: "3px 10px", borderRadius: "20px",
    backgroundColor: "#dcfce7", color: "#16a34a",
    fontSize: "12px", fontWeight: "500",
  },

  chartArea: { display: "flex", alignItems: "flex-end", gap: "10px", height: "120px", paddingTop: "24px" },
  chartCol: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", gap: "4px" },
  chartCount: { fontSize: "11px", color: "#6b7280", fontWeight: "600" },
  chartBarTrack: { flex: 1, width: "100%", display: "flex", alignItems: "flex-end" },
  chartBar: { width: "100%", backgroundColor: "#818cf8", borderRadius: "4px 4px 0 0", transition: "height 0.3s" },
  chartMonth: { fontSize: "10px", color: "#9ca3af" },

  scheduleRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "8px 0", borderBottom: "1px solid #f9fafb",
  },
  scheduleLeft: { display: "flex", alignItems: "center", gap: "10px" },
  dayToggle: { width: "36px", height: "20px", borderRadius: "10px", position: "relative", cursor: "pointer", transition: "background-color 0.2s" },
  dayThumb: { position: "absolute", top: "2px", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "white", transition: "transform 0.2s" },
  dayLabel: { fontSize: "13px", fontWeight: "500", width: "36px" },
  timeInputs: { display: "flex", alignItems: "center", gap: "6px" },
  timeInput: { padding: "4px 6px", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "12px", outline: "none" },
  timeDisplay: { fontSize: "12px", color: "#6b7280" },
  offLabel: { fontSize: "12px", color: "#d1d5db" },

  primaryButton: {
    padding: "9px 16px", borderRadius: "8px", border: "none",
    backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "13px",
  },
  outlineButton: {
    padding: "7px 14px", borderRadius: "8px",
    border: "1px solid #818cf8", backgroundColor: "white",
    color: "#818cf8", cursor: "pointer", fontSize: "13px",
  },
  smallButton: {
    padding: "6px 12px", borderRadius: "8px",
    border: "1px solid #818cf8", backgroundColor: "white",
    color: "#818cf8", cursor: "pointer", fontSize: "12px",
  },
  disabledButton: {
    padding: "9px 16px", borderRadius: "8px", border: "none",
    backgroundColor: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed", fontSize: "13px",
  },
  savedText: { color: "#16a34a", fontSize: "13px", margin: "4px 0 0" },
  badgeHigh: { padding: "3px 10px", borderRadius: "20px", backgroundColor: "#fee2e2", color: "#dc2626", fontSize: "12px", fontWeight: "500" },
  badgeMedium: { padding: "3px 10px", borderRadius: "20px", backgroundColor: "#fef9c3", color: "#ca8a04", fontSize: "12px", fontWeight: "500" },
};

export default CounsellorDashboard;
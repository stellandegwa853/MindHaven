import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../utils/auth";

function CounsellorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authFetch } = useAuth();

  const [available, setAvailable]         = useState(true);
  const [notifOpen, setNotifOpen]         = useState(false);
  const [scheduleOpen, setScheduleOpen]   = useState(false);
  const [activeSessionNote, setActiveSessionNote] = useState("");
  const [noteSaved, setNoteSaved]         = useState(false);

  // Live data
  const [appointments, setAppointments]   = useState([]);
  const [sessions, setSessions]           = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [riskFlags, setRiskFlags]         = useState([]);
  const [loading, setLoading]             = useState(true);

  const [schedule, setSchedule] = useState({
    Monday:    { enabled: true,  start: "09:00", end: "12:00" },
    Tuesday:   { enabled: false, start: "09:00", end: "12:00" },
    Wednesday: { enabled: true,  start: "14:00", end: "17:00" },
    Thursday:  { enabled: false, start: "09:00", end: "12:00" },
    Friday:    { enabled: true,  start: "10:00", end: "13:00" },
  });

  const navItems = [
    { label: "Dashboard",     path: "/counsellor-dashboard" },
    { label: "Active Session",path: "/counsellor-chat"      },
  ];

  // ── Fetch data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      authFetch("/api/appointments").then((r) => r.json()).catch(() => []),
      authFetch("/api/sessions").then((r) => r.json()).catch(() => []),
      authFetch("/api/users/notifications").then((r) => r.json()).catch(() => []),
    ]).then(([appts, sess, notifs]) => {
      setAppointments(Array.isArray(appts) ? appts : []);
      setSessions(Array.isArray(sess) ? sess : []);
      setNotifications(Array.isArray(notifs) ? notifs : []);
    }).finally(() => setLoading(false));
  }, []); // eslint-disable-line

  // ── Derived state ───────────────────────────────────────────────────────────
  // Confirmed appointments not yet started
  const pendingAppointments = appointments.filter((a) => a.status === "confirmed");

  // Currently in-progress session
  const activeSession = sessions.find((s) => s.session_status === "in_progress") ?? null;

  // Completed sessions (for history)
  const completedSessions = sessions.filter((s) => s.session_status === "completed");

  // Stats
  const today = new Date().toISOString().split("T")[0];
  const todaySessions = sessions.filter((s) => {
    const apptDate = s.scheduled_date ? s.scheduled_date.split("T")[0] : "";
    return apptDate === today;
  });

  // Chart data from real sessions
  const sessionsByMonth = completedSessions.reduce((acc, s) => {
    const month = new Date(s.scheduled_date || s.started_at).toLocaleDateString("en-GB", { month: "short" });
    acc[month] = (acc[month] ?? 0) + 1;
    return acc;
  }, {});
  const chartMonths = ["Oct","Nov","Dec","Jan","Feb","Mar"];
  const chartData = chartMonths.map((m) => ({ month: m, count: sessionsByMonth[m] ?? 0 }));
  const maxCount  = Math.max(...chartData.map((d) => d.count), 1);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ── Join/start session ──────────────────────────────────────────────────────
  const handleJoinSession = useCallback(async (appointment) => {
    // If there's already an in-progress session, rejoin it
    if (activeSession) {
      navigate("/counsellor-chat", {
        state: {
          session: {
            session_id:   activeSession.session_id,
            student_name: activeSession.student_name ?? "Student",
            student_id:   activeSession.student_id,
          },
        },
      });
      return;
    }

    if (!appointment) return;

    try {
      const res = await authFetch("/api/sessions", {
        method: "POST",
        body: JSON.stringify({ appointment_id: appointment.appointment_id }),
      });

      let session_id;
      if (res.status === 409) {
        // Session already exists — find it
        const existing = sessions.find((s) => s.appointment_id === appointment.appointment_id);
        if (existing) {
          session_id = existing.session_id;
        } else {
          const refresh = await authFetch("/api/sessions").then((r) => r.json());
          session_id = (Array.isArray(refresh) ? refresh : []).find((s) => s.appointment_id === appointment.appointment_id)?.session_id;
        }
      } else if (res.ok) {
        const data = await res.json();
        session_id = data.session_id;
      } else {
        const err = await res.json();
        throw new Error(err.error || "Could not start session");
      }

      navigate("/counsellor-chat", {
        state: {
          session: {
            session_id,
            student_name: appointment.student_name ?? "Student",
            student_id:   appointment.student_id,
          },
        },
      });
    } catch (err) {
      console.error("Start session error:", err);
      alert(err.message);
    }
  }, [activeSession, sessions, authFetch, navigate]);

  const toggleDay    = (day)           => setSchedule((p) => ({ ...p, [day]: { ...p[day], enabled: !p[day].enabled } }));
  const updateTime   = (day, f, val)   => setSchedule((p) => ({ ...p, [day]: { ...p[day], [f]: val } }));
  const handleLogout = () => { logoutUser(); navigate("/login"); };

  return (
    <div style={S.container}>

      {/* Sidebar */}
      <div style={S.sidebar}>
        <h2 style={S.logo}>Mind Haven</h2>
        {navItems.map((item) => (
          <button key={item.path}
            style={location.pathname === item.path ? S.navButtonActive : S.navButton}
            onClick={() => navigate(item.path)}>
            {item.label}
          </button>
        ))}

        {/* Availability toggle */}
        <div style={S.availabilityToggle}>
          <span style={S.availLabel}>Available</span>
          <div style={{ ...S.toggleTrack, backgroundColor: available ? "#818cf8" : "#d1d5db" }}
               onClick={() => setAvailable(!available)}>
            <div style={{ ...S.toggleThumb, transform: available ? "translateX(20px)" : "translateX(2px)" }} />
          </div>
        </div>

        <button style={S.logoutButton} onClick={handleLogout}>Logout</button>
      </div>

      {/* Main Content */}
      <div style={S.mainContent}>

        {/* Topbar */}
        <div style={S.topbar}>
          <div>
            <h1 style={S.title}>Counsellor Workspace</h1>
            <p style={S.subtitle}>Welcome back, {user?.full_name?.split(" ")[0] ?? "Counsellor"}</p>
          </div>
          <div style={S.topbarRight}>
            <span style={available ? S.statusOnline : S.statusOffline}>
              {available ? "● Available" : "○ Unavailable"}
            </span>
            <div style={S.notifWrapper}>
              <button style={S.notifButton} onClick={() => setNotifOpen(!notifOpen)}>
                🔔
                {unreadCount > 0 && <span style={S.notifBadge}>{unreadCount}</span>}
              </button>
              {notifOpen && (
                <div style={S.notifDropdown}>
                  <p style={S.notifHeader}>Notifications</p>
                  {notifications.length === 0 && <p style={{ padding: "12px 16px", fontSize: "13px", color: "#9ca3af" }}>No notifications</p>}
                  {notifications.map((n, i) => (
                    <div key={n.notif_id ?? i} style={{ ...S.notifItem, backgroundColor: !n.is_read ? "#ede9fe" : "white" }}>
                      <p style={S.notifText}>{n.body ?? n.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={S.cardContainer}>
          {[
            { label: "Sessions Today",  value: loading ? "…" : todaySessions.length.toString() },
            { label: "Active Sessions", value: loading ? "…" : (activeSession ? "1" : "0") },
            { label: "Total Sessions",  value: loading ? "…" : completedSessions.length.toString() },
            { label: "Pending Appts",   value: loading ? "…" : pendingAppointments.length.toString() },
          ].map((c) => (
            <div key={c.label} style={S.summaryCard}>
              <h3 style={S.summaryCardTitle}>{c.label}</h3>
              <p style={S.cardNumber}>{c.value}</p>
            </div>
          ))}
        </div>

        <div style={S.twoColRow}>

          {/* Left column */}
          <div style={{ flex: 1.2, display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Risk flags */}
            {riskFlags.length > 0 && (
              <div style={S.riskSection}>
                <p style={S.riskHeader}>⚠ Student risk flags requiring attention</p>
                {riskFlags.map((f, i) => (
                  <div key={f.flag_id ?? i} style={S.riskRow}>
                    <div>
                      <p style={S.riskLabel}>{f.student_name ?? "Student"}</p>
                      <p style={S.riskMeta}>{f.trigger_keyword} · {new Date(f.created_at).toLocaleDateString("en-GB")}</p>
                    </div>
                    <div style={S.riskRight}>
                      <span style={f.risk_level === "high" ? S.badgeHigh : S.badgeMedium}>{f.risk_level}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active session / pending appointments */}
            <div style={S.card}>
              <p style={S.cardLabel}>
                {activeSession ? "Active session" : "Pending appointments"}
              </p>

              {loading && <p style={{ color: "#9ca3af", fontSize: "13px" }}>Loading…</p>}

              {!loading && activeSession && (
                <div style={S.clientRow}>
                  <div>
                    <p style={S.clientName}>{activeSession.student_name ?? "Student"}</p>
                    <p style={S.clientMeta}>● Session in progress</p>
                  </div>
                  <button style={S.primaryButton} onClick={() => handleJoinSession(null)}>Rejoin Session</button>
                </div>
              )}

              {!loading && !activeSession && pendingAppointments.length === 0 && (
                <p style={{ color: "#9ca3af", fontSize: "13px" }}>No pending appointments.</p>
              )}

              {!loading && !activeSession && pendingAppointments.map((appt) => (
                <div key={appt.appointment_id} style={{ ...S.clientRow, borderBottom: "1px solid #f3f4f6", paddingBottom: "12px", marginBottom: "12px" }}>
                  <div>
                    <p style={S.clientName}>{appt.student_name ?? "Student"}</p>
                    <p style={S.clientMeta}>
                      {new Date(appt.scheduled_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {appt.start_time?.slice(0,5)}
                    </p>
                  </div>
                  <button style={S.primaryButton} onClick={() => handleJoinSession(appt)}>Start Session</button>
                </div>
              ))}
            </div>

            {/* Recent sessions */}
            <div style={S.card}>
              <p style={S.cardLabel}>Recent sessions</p>
              {completedSessions.length === 0 && <p style={{ color: "#9ca3af", fontSize: "13px" }}>No completed sessions yet.</p>}
              {completedSessions.slice(0, 5).map((s, i) => (
                <div key={s.session_id ?? i} style={S.sessionItem}>
                  <span style={{ fontSize: "13px" }}>
                    {new Date(s.scheduled_date || s.started_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    {s.student_name ?? "Student"}
                  </span>
                  <span style={S.completedBadge}>Completed</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Sessions per month chart */}
            <div style={S.card}>
              <p style={S.cardLabel}>Sessions per month</p>
              <div style={S.chartArea}>
                {chartData.map((d) => (
                  <div key={d.month} style={S.chartCol}>
                    <span style={S.chartCount}>{d.count}</span>
                    <div style={S.chartBarTrack}>
                      <div style={{ ...S.chartBar, height: `${(d.count / maxCount) * 100}%` }} />
                    </div>
                    <span style={S.chartMonth}>{d.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability schedule */}
            <div style={S.card}>
              <div style={S.sectionHeader}>
                <p style={S.cardLabel}>Availability schedule</p>
                <button style={S.smallButton} onClick={() => setScheduleOpen(!scheduleOpen)}>
                  {scheduleOpen ? "Done" : "Edit"}
                </button>
              </div>
              {Object.entries(schedule).map(([day, slot]) => (
                <div key={day} style={S.scheduleRow}>
                  <div style={S.scheduleLeft}>
                    <div style={{ ...S.dayToggle, backgroundColor: slot.enabled ? "#818cf8" : "#e5e7eb" }}
                         onClick={() => toggleDay(day)}>
                      <div style={{ ...S.dayThumb, transform: slot.enabled ? "translateX(16px)" : "translateX(2px)" }} />
                    </div>
                    <span style={{ ...S.dayLabel, color: slot.enabled ? "#111827" : "#9ca3af" }}>{day.slice(0,3)}</span>
                  </div>
                  {slot.enabled && scheduleOpen ? (
                    <div style={S.timeInputs}>
                      <input type="time" style={S.timeInput} value={slot.start} onChange={(e) => updateTime(day, "start", e.target.value)} />
                      <span style={{ fontSize: "11px", color: "#9ca3af" }}>to</span>
                      <input type="time" style={S.timeInput} value={slot.end}   onChange={(e) => updateTime(day, "end",   e.target.value)} />
                    </div>
                  ) : slot.enabled ? (
                    <span style={S.timeDisplay}>{slot.start} – {slot.end}</span>
                  ) : (
                    <span style={S.offLabel}>Off</span>
                  )}
                </div>
              ))}
              {scheduleOpen && (
                <button style={{ ...S.primaryButton, marginTop: "12px", width: "100%" }}>Save Schedule</button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  container:  { display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" },
  sidebar:    { width: "240px", backgroundColor: "#111827", color: "white", display: "flex", flexDirection: "column", padding: "25px 20px", gap: "10px" },
  logo:       { fontSize: "20px", marginBottom: "20px" },
  navButton:       { padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "#9ca3af", cursor: "pointer", textAlign: "left", fontSize: "14px" },
  navButtonActive: { padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", textAlign: "left", fontSize: "14px" },
  availabilityToggle: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px", borderRadius: "8px", backgroundColor: "#1f2937", marginTop: "8px" },
  availLabel:  { fontSize: "13px", color: "#d1d5db" },
  toggleTrack: { width: "42px", height: "24px", borderRadius: "12px", position: "relative", cursor: "pointer", transition: "background-color 0.2s" },
  toggleThumb: { position: "absolute", top: "3px", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "white", transition: "transform 0.2s" },
  logoutButton:    { marginTop: "auto", padding: "10px", borderRadius: "8px", border: "1px solid #4b5563", backgroundColor: "transparent", color: "white", cursor: "pointer" },
  mainContent: { flex: 1, padding: "32px 40px", backgroundColor: "#f3f4f6", overflowY: "auto" },
  topbar:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  title:       { margin: "0 0 4px", fontSize: "22px", fontWeight: "bold" },
  subtitle:    { margin: 0, fontSize: "13px", color: "#6b7280" },
  topbarRight: { display: "flex", alignItems: "center", gap: "14px" },
  statusOnline:  { fontSize: "12px", color: "#16a34a", fontWeight: "500", backgroundColor: "#dcfce7", padding: "5px 10px", borderRadius: "20px" },
  statusOffline: { fontSize: "12px", color: "#6b7280", fontWeight: "500", backgroundColor: "#f3f4f6", padding: "5px 10px", borderRadius: "20px", border: "1px solid #e5e7eb" },
  notifWrapper:  { position: "relative" },
  notifButton:   { position: "relative", background: "white", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "8px 12px", cursor: "pointer", fontSize: "18px" },
  notifBadge:    { position: "absolute", top: "-6px", right: "-6px", backgroundColor: "#818cf8", color: "white", borderRadius: "50%", fontSize: "10px", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" },
  notifDropdown: { position: "absolute", right: 0, top: "44px", width: "300px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100, overflow: "hidden" },
  notifHeader:   { margin: 0, padding: "12px 16px", fontWeight: "600", fontSize: "13px", borderBottom: "1px solid #f3f4f6" },
  notifItem:     { padding: "10px 16px", borderBottom: "1px solid #f9fafb" },
  notifText:     { margin: 0, fontSize: "13px", color: "#374151" },
  cardContainer: { display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" },
  summaryCard:   { backgroundColor: "white", padding: "18px 22px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", flex: 1, minWidth: "130px" },
  summaryCardTitle: { fontSize: "12px", color: "#6b7280", margin: "0 0 6px", fontWeight: "500" },
  cardNumber:    { fontSize: "26px", fontWeight: "bold", margin: 0, color: "#818cf8" },
  twoColRow:     { display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" },
  riskSection:   { backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "12px", padding: "16px" },
  riskHeader:    { margin: "0 0 12px", fontSize: "13px", fontWeight: "600", color: "#c2410c" },
  riskRow:       { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: "10px 14px", borderRadius: "8px", marginBottom: "8px", borderLeft: "3px solid #f97316" },
  riskLabel:     { margin: 0, fontWeight: "600", fontSize: "13px" },
  riskMeta:      { margin: "3px 0 0", fontSize: "12px", color: "#6b7280" },
  riskRight:     { display: "flex", gap: "8px", alignItems: "center" },
  card:          { backgroundColor: "white", padding: "18px 20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
  cardLabel:     { margin: "0 0 12px", fontSize: "13px", fontWeight: "600", color: "#374151" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  clientRow:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  clientName:    { margin: "0 0 3px", fontWeight: "600", fontSize: "14px" },
  clientMeta:    { margin: 0, fontSize: "12px", color: "#6b7280" },
  sessionItem:   { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" },
  completedBadge:{ padding: "3px 10px", borderRadius: "20px", backgroundColor: "#dcfce7", color: "#16a34a", fontSize: "12px", fontWeight: "500" },
  chartArea:     { display: "flex", alignItems: "flex-end", gap: "10px", height: "120px", paddingTop: "24px" },
  chartCol:      { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", gap: "4px" },
  chartCount:    { fontSize: "11px", color: "#6b7280", fontWeight: "600" },
  chartBarTrack: { flex: 1, width: "100%", display: "flex", alignItems: "flex-end" },
  chartBar:      { width: "100%", backgroundColor: "#818cf8", borderRadius: "4px 4px 0 0", transition: "height 0.3s" },
  chartMonth:    { fontSize: "10px", color: "#9ca3af" },
  scheduleRow:   { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f9fafb" },
  scheduleLeft:  { display: "flex", alignItems: "center", gap: "10px" },
  dayToggle:     { width: "36px", height: "20px", borderRadius: "10px", position: "relative", cursor: "pointer", transition: "background-color 0.2s" },
  dayThumb:      { position: "absolute", top: "2px", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "white", transition: "transform 0.2s" },
  dayLabel:      { fontSize: "13px", fontWeight: "500", width: "36px" },
  timeInputs:    { display: "flex", alignItems: "center", gap: "6px" },
  timeInput:     { padding: "4px 6px", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "12px", outline: "none" },
  timeDisplay:   { fontSize: "12px", color: "#6b7280" },
  offLabel:      { fontSize: "12px", color: "#d1d5db" },
  primaryButton: { padding: "9px 16px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "13px" },
  smallButton:   { padding: "6px 12px", borderRadius: "8px", border: "1px solid #818cf8", backgroundColor: "white", color: "#818cf8", cursor: "pointer", fontSize: "12px" },
  badgeHigh:     { padding: "3px 10px", borderRadius: "20px", backgroundColor: "#fee2e2", color: "#dc2626", fontSize: "12px", fontWeight: "500" },
  badgeMedium:   { padding: "3px 10px", borderRadius: "20px", backgroundColor: "#fef9c3", color: "#ca8a04", fontSize: "12px", fontWeight: "500" },
};

export default CounsellorDashboard;
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../utils/auth";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

function UserDashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, authFetch } = useAuth();

  const [mood, setMood]           = useState(null);
  const [moodSaved, setMoodSaved] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Live data from API
  const [appointments, setAppointments]   = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [moodHistory, setMoodHistory]     = useState([]);
  const [sessionStats, setSessionStats]   = useState(null);
  const [loadingAppt, setLoadingAppt]     = useState(true);

  const moodLineRef    = useRef(null);
  const sessionPieRef  = useRef(null);
  const activityBarRef = useRef(null);
  const moodDonutRef   = useRef(null);
  const chartsRef      = useRef({});

  const navItems = [
    { label: "Dashboard",    path: "/dashboard"       },
    { label: "Chat",         path: "/chat"            },
    { label: "AI Support",   path: "/ai-chat"         },
    { label: "Appointments", path: "/appointments"    },
    { label: "Journal",      path: "/journal"         },
    { label: "Sessions",     path: "/session-history" },
    { label: "Resources",    path: "/resources"       },
  ];

  const moods = [
    { label: "Great", emoji: "😄", value: 5, color: "#16a34a" },
    { label: "Good",  emoji: "🙂", value: 4, color: "#65a30d" },
    { label: "Okay",  emoji: "😐", value: 3, color: "#ca8a04" },
    { label: "Low",   emoji: "😔", value: 2, color: "#ea580c" },
    { label: "Bad",   emoji: "😢", value: 1, color: "#dc2626" },
  ];

  // ── Fetch appointments ──────────────────────────────────────────────────────
  useEffect(() => {
    authFetch("/api/appointments")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setAppointments(data))
      .catch(console.error)
      .finally(() => setLoadingAppt(false));
  }, []); // eslint-disable-line

  // ── Fetch notifications ─────────────────────────────────────────────────────
  useEffect(() => {
    authFetch("/api/users/notifications")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setNotifications(data))
      .catch(() => {}); // non-critical
  }, []); // eslint-disable-line

  // ── Fetch mood history ──────────────────────────────────────────────────────
  useEffect(() => {
    authFetch("/api/mood")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setMoodHistory(data))
      .catch(() => {});
  }, []); // eslint-disable-line

  // ── Upcoming confirmed appointment (soonest future one) ─────────────────────
  const upcomingAppointment = appointments
    .filter((a) => a.status === "confirmed" && new Date(`${a.scheduled_date}T${a.start_time}`) > new Date())
    .sort((a, b) => new Date(`${a.scheduled_date}T${a.start_time}`) - new Date(`${b.scheduled_date}T${b.start_time}`))[0] ?? null;

  // ── Active in-progress session (if any) ─────────────────────────────────────
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    authFetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const inProgress = data.find((s) => s.session_status === "in_progress");
        setActiveSession(inProgress ?? null);
      })
      .catch(() => {});
  }, []); // eslint-disable-line

  // ── Join or start session ───────────────────────────────────────────────────
  const handleJoinSession = useCallback(async () => {
    // If there's already an in-progress session, jump straight in
    if (activeSession) {
      navigate("/chat", {
        state: {
          session: {
            session_id:      activeSession.session_id,
            counsellor_name: activeSession.counsellor_name ?? "Your Counsellor",
            counsellor_id:   activeSession.counsellor_id,
          },
        },
      });
      return;
    }

    // Otherwise, check if there's a confirmed appointment to start from
    if (!upcomingAppointment) {
      navigate("/appointments");
      return;
    }

    try {
      // Create the session from the confirmed appointment
      const res = await authFetch("/api/sessions", {
        method: "POST",
        body: JSON.stringify({ appointment_id: upcomingAppointment.appointment_id }),
      });

      if (!res.ok) {
        const err = await res.json();
        // 409 = session already exists for this appointment — fetch it
        if (res.status === 409) {
          const sessRes = await authFetch("/api/sessions");
          const sessions = await sessRes.json();
          const existing = Array.isArray(sessions)
            ? sessions.find((s) => s.appointment_id === upcomingAppointment.appointment_id)
            : null;
          if (existing) {
            navigate("/chat", {
              state: {
                session: {
                  session_id:      existing.session_id,
                  counsellor_name: upcomingAppointment.counsellor_name,
                  counsellor_id:   upcomingAppointment.counsellor_id,
                },
              },
            });
          }
          return;
        }
        throw new Error(err.error || "Could not start session");
      }

      const { session_id } = await res.json();
      navigate("/chat", {
        state: {
          session: {
            session_id,
            counsellor_name: upcomingAppointment.counsellor_name,
            counsellor_id:   upcomingAppointment.counsellor_id,
          },
        },
      });
    } catch (err) {
      console.error("Join session error:", err);
      alert(err.message);
    }
  }, [activeSession, upcomingAppointment, authFetch, navigate]);

  // ── Save mood ───────────────────────────────────────────────────────────────
  const handleSaveMood = useCallback(async () => {
    if (!mood) return;
    try {
      await authFetch("/api/mood", {
        method: "POST",
        body: JSON.stringify({ mood_score: mood.value }),
      });
      setMoodSaved(true);
    } catch (err) {
      console.error("Save mood error:", err);
    }
  }, [mood, authFetch]);

  // ── Charts ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Destroy old charts before re-creating
    Object.values(chartsRef.current).forEach((c) => c?.destroy());
    chartsRef.current = {};

    const gridColor = "rgba(136,135,128,0.12)";
    const tickColor = "#888780";
    const tickFont  = { size: 11 };

    // Build mood line labels & values from API data (last 7 days), fallback to sample
    const last7 = moodHistory.slice(-7);
    const moodLabels = last7.length
      ? last7.map((m) => new Date(m.recorded_at).toLocaleDateString("en-GB", { weekday: "short" }))
      : ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    const moodValues = last7.length ? last7.map((m) => m.mood_score) : [3,4,3,5,4,4,5];

    chartsRef.current.moodLine = new Chart(moodLineRef.current, {
      type: "line",
      data: {
        labels: moodLabels,
        datasets: [{
          data: moodValues,
          borderColor: "#818cf8", backgroundColor: "rgba(129,140,248,0.10)",
          borderWidth: 2, pointRadius: 4, pointBackgroundColor: "#818cf8",
          tension: 0.4, fill: true,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: tickFont, color: tickColor } },
          y: {
            min: 1, max: 5, grid: { color: gridColor }, border: { display: false },
            ticks: { font: tickFont, color: tickColor, stepSize: 1,
              callback: (v) => ["","Bad","Low","Okay","Good","Great"][v] || v },
          },
        },
      },
    });

    chartsRef.current.sessionPie = new Chart(sessionPieRef.current, {
      type: "doughnut",
      data: {
        labels: ["Chat sessions","Journal entries"],
        datasets: [{ data: [60,40], backgroundColor: ["#818cf8","#c7d2fe"], borderWidth: 0, hoverOffset: 4 }],
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: "68%", plugins: { legend: { display: false } } },
    });

    chartsRef.current.activityBar = new Chart(activityBarRef.current, {
      type: "bar",
      data: {
        labels: ["Oct","Nov","Dec","Jan","Feb","Mar"],
        datasets: [
          { label: "Sessions", data: [2,3,2,5,4,6], backgroundColor: "#818cf8", borderRadius: 4, barPercentage: 0.55 },
          { label: "Journal",  data: [4,6,3,9,10,14], backgroundColor: "#c7d2fe", borderRadius: 4, barPercentage: 0.55 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: tickFont, color: tickColor, autoSkip: false } },
          y: { grid: { color: gridColor }, ticks: { font: tickFont, color: tickColor }, border: { display: false } },
        },
      },
    });

    chartsRef.current.moodDonut = new Chart(moodDonutRef.current, {
      type: "doughnut",
      data: {
        labels: ["Great","Good","Okay","Low","Bad"],
        datasets: [{ data: [22,35,28,11,4], backgroundColor: ["#16a34a","#818cf8","#facc15","#f97316","#ef4444"], borderWidth: 0, hoverOffset: 4 }],
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: "60%", plugins: { legend: { display: false } } },
    });

    return () => Object.values(chartsRef.current).forEach((c) => c?.destroy());
  }, [moodHistory]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleLogout = () => { logoutUser(); navigate("/login"); };

  // ── Render upcoming appointment card ────────────────────────────────────────
  const renderAppointmentCard = () => {
    if (loadingAppt) {
      return <p style={{ color: "#9ca3af", fontSize: "13px" }}>Loading…</p>;
    }
    if (!upcomingAppointment && !activeSession) {
      return (
        <>
          <p style={{ color: "#6b7280", fontSize: "13px", margin: "0 0 16px" }}>No upcoming appointments.</p>
          <button style={styles.primaryButton} onClick={() => navigate("/appointments")}>Book Appointment</button>
        </>
      );
    }

    const appt = upcomingAppointment;
    const dateObj = appt ? new Date(appt.scheduled_date) : null;

    return (
      <>
        {activeSession && (
          <div style={styles.activeBadge}>● Session in progress</div>
        )}
        {appt && (
          <div style={styles.apptRow}>
            <div style={styles.apptDate}>
              <span style={styles.apptDay}>{dateObj.getDate()}</span>
              <span style={styles.apptMonth}>{dateObj.toLocaleDateString("en-GB", { month: "short" })}</span>
            </div>
            <div>
              <p style={styles.apptCounsellor}>{appt.counsellor_name}</p>
              <p style={styles.apptMeta}>{appt.start_time?.slice(0,5)} · {appt.end_time?.slice(0,5)}</p>
            </div>
          </div>
        )}
        <button style={styles.primaryButton} onClick={handleJoinSession}>
          {activeSession ? "Rejoin Session" : "Join Session"}
        </button>
      </>
    );
  };

  return (
    <div style={styles.container}>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>Mind Haven</h2>
        {navItems.map((item) => (
          <button key={item.path}
            style={location.pathname === item.path ? styles.navButtonActive : styles.navButton}
            onClick={() => navigate(item.path)}>
            {item.label}
          </button>
        ))}
        <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>

        {/* Topbar */}
        <div style={styles.topbar}>
          <h1 style={styles.title}>Welcome back, {user?.full_name?.split(" ")[0] ?? "there"} 👋</h1>
          <div style={styles.notifWrapper}>
            <button style={styles.notifButton} onClick={() => setNotifOpen(!notifOpen)}>
              🔔
              {unreadCount > 0 && <span style={styles.notifBadge}>{unreadCount}</span>}
            </button>
            {notifOpen && (
              <div style={styles.notifDropdown}>
                <p style={styles.notifHeader}>Notifications</p>
                {notifications.length === 0 && <p style={{ padding: "12px 16px", fontSize: "13px", color: "#9ca3af" }}>No notifications</p>}
                {notifications.map((n) => (
                  <div key={n.notif_id ?? n.id} style={{ ...styles.notifItem, backgroundColor: !n.is_read ? "#ede9fe" : "white" }}>
                    <p style={styles.notifText}>{n.body ?? n.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top row */}
        <div style={styles.twoColRow}>

          {/* Upcoming Appointment */}
          <div style={styles.card}>
            <p style={styles.cardLabel}>Upcoming appointment</p>
            {renderAppointmentCard()}
          </div>

          {/* Mood Tracker */}
          <div style={styles.card}>
            <p style={styles.cardLabel}>How are you feeling today?</p>
            <div style={styles.moodRow}>
              {moods.map((m) => (
                <button key={m.value} title={m.label}
                  onClick={() => { setMood(m); setMoodSaved(false); }}
                  style={{
                    ...styles.moodBtn,
                    border: mood?.value === m.value ? `2px solid ${m.color}` : "2px solid transparent",
                    backgroundColor: mood?.value === m.value ? `${m.color}18` : "transparent",
                  }}>
                  <span style={{ fontSize: "24px" }}>{m.emoji}</span>
                  <span style={{ fontSize: "10px", color: "#6b7280" }}>{m.label}</span>
                </button>
              ))}
            </div>
            {moodSaved ? (
              <p style={styles.savedText}>✓ Mood logged for today</p>
            ) : (
              <button style={mood ? styles.primaryButton : styles.disabledButton} onClick={handleSaveMood} disabled={!mood}>
                Log Mood
              </button>
            )}
          </div>
        </div>

        {/* Charts */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Your wellness stats</h3>

          <div style={styles.chartsRow3}>
            <div style={styles.chartCard}>
              <p style={styles.chartTitle}>Mood over time</p>
              <p style={styles.chartSub}>Last 7 days</p>
              <div style={{ position: "relative", width: "100%", height: "140px" }}>
                <canvas ref={moodLineRef} />
              </div>
            </div>

            <div style={styles.chartCard}>
              <p style={styles.chartTitle}>Session types</p>
              <p style={styles.chartSub}>This month</p>
              <div style={{ position: "relative", width: "100%", height: "110px" }}>
                <canvas ref={sessionPieRef} />
              </div>
              <div style={styles.legend}>
                <span style={styles.legendItem}><span style={{ ...styles.legendDot, backgroundColor: "#818cf8" }} />Chat 60%</span>
                <span style={styles.legendItem}><span style={{ ...styles.legendDot, backgroundColor: "#c7d2fe" }} />Journal 40%</span>
              </div>
            </div>

            <div style={styles.chartCard}>
              <p style={styles.chartTitle}>Wellness summary</p>
              <p style={styles.chartSub}>This month</p>
              {[
                { label: "Sessions completed", value: appointments.filter((a) => a.status === "completed").length.toString() },
                { label: "Avg mood score",     value: moodHistory.length ? (moodHistory.reduce((s, m) => s + m.mood_score, 0) / moodHistory.length).toFixed(1) + " / 5" : "—" },
                { label: "Journal entries",    value: "—" },
                { label: "Total chat time",    value: "—" },
              ].map((s) => (
                <div key={s.label} style={styles.statRow}>
                  <span style={styles.statLabel}>{s.label}</span>
                  <span style={styles.statVal}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.chartsRow2}>
            <div style={styles.chartCard}>
              <p style={styles.chartTitle}>Activity per month</p>
              <p style={styles.chartSub}>Last 6 months</p>
              <div style={styles.legend}>
                <span style={styles.legendItem}><span style={{ ...styles.legendDot, backgroundColor: "#818cf8" }} />Sessions</span>
                <span style={styles.legendItem}><span style={{ ...styles.legendDot, backgroundColor: "#c7d2fe" }} />Journal entries</span>
              </div>
              <div style={{ position: "relative", width: "100%", height: "160px" }}>
                <canvas ref={activityBarRef} />
              </div>
            </div>

            <div style={styles.chartCard}>
              <p style={styles.chartTitle}>Mood distribution</p>
              <p style={styles.chartSub}>All time</p>
              <div style={{ position: "relative", width: "100%", height: "140px" }}>
                <canvas ref={moodDonutRef} />
              </div>
              <div style={{ ...styles.legend, justifyContent: "center", flexWrap: "wrap", marginTop: "10px" }}>
                {[["#16a34a","Great"],["#818cf8","Good"],["#facc15","Okay"],["#f97316","Low"],["#ef4444","Bad"]].map(([color, label]) => (
                  <span key={label} style={styles.legendItem}><span style={{ ...styles.legendDot, backgroundColor: color }} />{label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Wellness Resources</h3>
          <div style={styles.resourceButtons}>
            {["Breathing Exercises","Self-Care Guide","Crisis Support Contacts"].map((r) => (
              <button key={r} style={styles.resourceButton} onClick={() => navigate("/resources")}>{r}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container:  { display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" },
  sidebar:    { width: "240px", backgroundColor: "#111827", color: "white", display: "flex", flexDirection: "column", padding: "25px 20px", gap: "10px" },
  logo:       { fontSize: "20px", marginBottom: "20px" },
  navButton:       { padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "#9ca3af", cursor: "pointer", textAlign: "left", fontSize: "14px" },
  navButtonActive: { padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", textAlign: "left", fontSize: "14px" },
  logoutButton:    { marginTop: "auto", padding: "10px", borderRadius: "8px", border: "1px solid #4b5563", backgroundColor: "transparent", color: "white", cursor: "pointer" },
  mainContent: { flex: 1, padding: "32px 40px", backgroundColor: "#f3f4f6", overflowY: "auto" },
  topbar:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" },
  title:   { margin: 0, fontSize: "22px", fontWeight: "bold" },
  notifWrapper:  { position: "relative" },
  notifButton:   { position: "relative", background: "white", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "8px 12px", cursor: "pointer", fontSize: "18px" },
  notifBadge:    { position: "absolute", top: "-6px", right: "-6px", backgroundColor: "#818cf8", color: "white", borderRadius: "50%", fontSize: "10px", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" },
  notifDropdown: { position: "absolute", right: 0, top: "44px", width: "300px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100, overflow: "hidden" },
  notifHeader:   { margin: 0, padding: "12px 16px", fontWeight: "600", fontSize: "13px", borderBottom: "1px solid #f3f4f6" },
  notifItem:     { padding: "10px 16px", borderBottom: "1px solid #f9fafb" },
  notifText:     { margin: 0, fontSize: "13px", color: "#374151" },
  twoColRow:  { display: "flex", gap: "20px", marginBottom: "28px", flexWrap: "wrap" },
  card:       { flex: 1, minWidth: "260px", backgroundColor: "white", padding: "20px 24px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
  cardLabel:  { margin: "0 0 14px", fontSize: "13px", fontWeight: "600", color: "#374151" },
  activeBadge:{ display: "inline-block", backgroundColor: "#dcfce7", color: "#16a34a", fontSize: "12px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px", marginBottom: "12px" },
  apptRow:    { display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" },
  apptDate:   { display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "#ede9fe", borderRadius: "10px", padding: "10px 14px", minWidth: "50px" },
  apptDay:    { fontSize: "22px", fontWeight: "bold", color: "#6d28d9", lineHeight: 1 },
  apptMonth:  { fontSize: "12px", color: "#7c3aed", marginTop: "2px" },
  apptCounsellor: { margin: "0 0 2px", fontWeight: "600", fontSize: "14px" },
  apptMeta:   { margin: "2px 0", fontSize: "12px", color: "#6b7280" },
  moodRow:    { display: "flex", gap: "6px", marginBottom: "14px", justifyContent: "space-between" },
  moodBtn:    { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px", borderRadius: "10px", cursor: "pointer", transition: "all 0.15s" },
  section:    { marginBottom: "32px" },
  sectionTitle: { fontSize: "15px", fontWeight: "600", margin: "0 0 16px", color: "#111827" },
  chartsRow3: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "16px", marginBottom: "16px" },
  chartsRow2: { display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: "16px" },
  chartCard:  { backgroundColor: "white", border: "1px solid #f3f4f6", borderRadius: "12px", padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  chartTitle: { fontSize: "13px", fontWeight: "600", color: "#374151", margin: "0 0 2px" },
  chartSub:   { fontSize: "11px", color: "#9ca3af", margin: "0 0 12px" },
  legend:     { display: "flex", gap: "12px", marginBottom: "8px", flexWrap: "wrap" },
  legendItem: { display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#6b7280" },
  legendDot:  { width: "9px", height: "9px", borderRadius: "2px", flexShrink: 0 },
  statRow:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #f9fafb", fontSize: "12px" },
  statLabel:  { color: "#6b7280" },
  statVal:    { fontWeight: "600", color: "#374151" },
  resourceButtons: { display: "flex", gap: "10px", flexWrap: "wrap" },
  resourceButton:  { padding: "10px 16px", borderRadius: "8px", border: "1px solid #818cf8", backgroundColor: "white", color: "#818cf8", cursor: "pointer", fontSize: "13px" },
  primaryButton:  { padding: "9px 16px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "13px" },
  disabledButton: { padding: "9px 16px", borderRadius: "8px", border: "none", backgroundColor: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed", fontSize: "13px" },
  savedText:  { color: "#16a34a", fontSize: "13px", margin: "4px 0 0" },
};

export default UserDashboard;
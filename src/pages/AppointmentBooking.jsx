import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../utils/auth";

const counsellors = [
  {
    id: 1,
    name: "Faith Njeri",
    specialization: "Anxiety & Stress",
    bio: "Experienced in helping students manage academic pressure and anxiety through evidence-based techniques.",
    availability: ["Monday 9am–12pm", "Wednesday 2pm–5pm", "Friday 10am–1pm"],
    sessions: 22,
    initials: "FN",
  },
  {
    id: 2,
    name: "George Kiprop",
    specialization: "Academic Pressure",
    bio: "Passionate about supporting students through exam stress, time management challenges and burnout.",
    availability: ["Tuesday 10am–1pm", "Thursday 9am–12pm"],
    sessions: 18,
    initials: "GK",
  },
  {
    id: 3,
    name: "Carlos Odhiambo",
    specialization: "Depression & Low Mood",
    bio: "Focused on creating a safe space for students experiencing low mood, grief, and emotional difficulties.",
    availability: ["Monday 2pm–5pm", "Wednesday 9am–12pm", "Friday 2pm–5pm"],
    sessions: 14,
    initials: "CO",
  },
  {
    id: 4,
    name: "Diana Wambui",
    specialization: "Relationships & Social Anxiety",
    bio: "Specialises in helping students build confidence, navigate friendships, and manage social situations.",
    availability: ["Tuesday 2pm–5pm", "Thursday 2pm–5pm"],
    sessions: 11,
    initials: "DW",
  },
];

const TIME_SLOTS = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM","2:00 PM","3:00 PM","4:00 PM"];

function AppointmentBooking() {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [selectedDate, setSelectedDate]             = useState("");
  const [selectedTime, setSelectedTime]             = useState("");
  const [step, setStep]                             = useState(1); // 1=browse, 2=book, 3=confirmed
  const [booked, setBooked]                         = useState(null);

  const navItems = [
    { label: "Dashboard",     path: "/dashboard"     },
    { label: "Chat",          path: "/chat"           },
    { label: "Appointments",  path: "/appointments"   },
    { label: "Resources",     path: "/resources"      },
    { label: "Journal",       path: "/journal"        },
  ];

  const handleSelectCounsellor = (c) => {
    setSelectedCounsellor(c);
    setSelectedDate("");
    setSelectedTime("");
    setStep(2);
  };

  const handleBook = () => {
    if (!selectedDate || !selectedTime) return;
    setBooked({ counsellor: selectedCounsellor, date: selectedDate, time: selectedTime });
    setStep(3);
    // TODO: POST /api/appointments { counsellor_id, scheduled_date, start_time }
  };

  const handleLogout = () => { logoutUser(); navigate("/login"); };

  // Get min date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={S.container}>

      {/* Sidebar */}
      <div style={S.sidebar}>
        <h2 style={S.logo}>Mind Haven</h2>
        {navItems.map((item) => (
          <button
            key={item.path}
            style={location.pathname === item.path ? S.navButtonActive : S.navButton}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
        <button style={S.logoutButton} onClick={handleLogout}>Logout</button>
      </div>

      {/* Main */}
      <div style={S.mainContent}>

        {/* Step 1 — Browse counsellors */}
        {step === 1 && (
          <>
            <div style={S.pageHeader}>
              <div>
                <h1 style={S.title}>Book a Session</h1>
                <p style={S.subtitle}>Choose a peer counsellor and pick a time that works for you.</p>
              </div>
            </div>

            <div style={S.grid}>
              {counsellors.map((c) => (
                <div key={c.id} style={S.counsellorCard}>
                  <div style={S.cardTop}>
                    <div style={S.avatar}>{c.initials}</div>
                    <div>
                      <p style={S.counsellorName}>{c.name}</p>
                      <span style={S.specialBadge}>{c.specialization}</span>
                    </div>
                  </div>
                  <p style={S.bio}>{c.bio}</p>
                  <div style={S.availSection}>
                    <p style={S.availLabel}>Availability</p>
                    {c.availability.map((a) => (
                      <span key={a} style={S.availPill}>{a}</span>
                    ))}
                  </div>
                  <div style={S.cardFooter}>
                    <span style={S.sessionsText}>{c.sessions} sessions completed</span>
                    <button style={S.bookBtn} onClick={() => handleSelectCounsellor(c)}>
                      Book →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Step 2 — Pick date and time */}
        {step === 2 && selectedCounsellor && (
          <div style={S.bookingPanel}>
            <button style={S.backBtn} onClick={() => setStep(1)}>← Back</button>
            <h1 style={S.title}>Book with {selectedCounsellor.name}</h1>
            <p style={S.subtitle}>{selectedCounsellor.specialization}</p>

            <div style={S.bookingCard}>

              {/* Counsellor summary */}
              <div style={S.counsellorSummary}>
                <div style={S.avatarLg}>{selectedCounsellor.initials}</div>
                <div>
                  <p style={S.counsellorName}>{selectedCounsellor.name}</p>
                  <p style={S.bio}>{selectedCounsellor.bio}</p>
                </div>
              </div>

              <div style={S.divider} />

              {/* Date picker */}
              <p style={S.fieldLabel}>Select a date</p>
              <input
                type="date"
                style={S.dateInput}
                min={today}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              {/* Time slots */}
              {selectedDate && (
                <>
                  <p style={{ ...S.fieldLabel, marginTop: "20px" }}>Select a time</p>
                  <div style={S.timeGrid}>
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        style={selectedTime === t ? S.timeSlotActive : S.timeSlot}
                        onClick={() => setSelectedTime(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Confirm */}
              {selectedDate && selectedTime && (
                <div style={S.confirmSection}>
                  <div style={S.confirmSummary}>
                    <p style={S.confirmText}>📅 {new Date(selectedDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                    <p style={S.confirmText}>🕐 {selectedTime}</p>
                    <p style={S.confirmText}>👤 {selectedCounsellor.name}</p>
                  </div>
                  <button style={S.confirmBtn} onClick={handleBook}>
                    Confirm Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3 — Confirmed */}
        {step === 3 && booked && (
          <div style={S.confirmedScreen}>
            <div style={S.confirmedCard}>
              <div style={S.successIcon}>✓</div>
              <h2 style={S.confirmedTitle}>Appointment Confirmed!</h2>
              <p style={S.confirmedText}>Your session has been booked successfully.</p>

              <div style={S.confirmedDetails}>
                <div style={S.detailRow}>
                  <span style={S.detailLabel}>Counsellor</span>
                  <span style={S.detailValue}>{booked.counsellor.name}</span>
                </div>
                <div style={S.detailRow}>
                  <span style={S.detailLabel}>Specialization</span>
                  <span style={S.detailValue}>{booked.counsellor.specialization}</span>
                </div>
                <div style={S.detailRow}>
                  <span style={S.detailLabel}>Date</span>
                  <span style={S.detailValue}>
                    {new Date(booked.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                <div style={S.detailRow}>
                  <span style={S.detailLabel}>Time</span>
                  <span style={S.detailValue}>{booked.time}</span>
                </div>
              </div>

              <p style={S.reminderText}>
                You will receive a notification when your counsellor confirms the session.
              </p>

              <div style={S.confirmedBtns}>
                <button style={S.dashboardBtn} onClick={() => navigate("/dashboard")}>
                  Back to Dashboard
                </button>
                <button style={S.bookAnotherBtn} onClick={() => { setStep(1); setBooked(null); }}>
                  Book Another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  container:   { display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" },
  sidebar:     { width: "240px", backgroundColor: "#111827", color: "white", display: "flex", flexDirection: "column", padding: "25px 20px", gap: "10px", flexShrink: 0 },
  logo:        { fontSize: "20px", marginBottom: "20px" },
  navButton:       { padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "#9ca3af", cursor: "pointer", textAlign: "left", fontSize: "14px" },
  navButtonActive: { padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", textAlign: "left", fontSize: "14px" },
  logoutButton:    { marginTop: "auto", padding: "10px", borderRadius: "8px", border: "1px solid #4b5563", backgroundColor: "transparent", color: "white", cursor: "pointer" },

  mainContent: { flex: 1, padding: "36px 40px", backgroundColor: "#f3f4f6", overflowY: "auto" },
  pageHeader:  { marginBottom: "28px" },
  title:       { margin: "0 0 6px", fontSize: "22px", fontWeight: "bold", color: "#111827" },
  subtitle:    { margin: 0, fontSize: "14px", color: "#6b7280" },

  // Counsellor grid
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" },
  counsellorCard: { backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #f3f4f6", display: "flex", flexDirection: "column", gap: "12px" },
  cardTop:     { display: "flex", alignItems: "center", gap: "12px" },
  avatar:      { width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#ede9fe", color: "#6d28d9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "14px", flexShrink: 0 },
  counsellorName: { margin: "0 0 4px", fontWeight: "600", fontSize: "14px", color: "#111827" },
  specialBadge:{ padding: "2px 10px", borderRadius: "20px", backgroundColor: "#ede9fe", color: "#6d28d9", fontSize: "11px", fontWeight: "500" },
  bio:         { margin: 0, fontSize: "13px", color: "#6b7280", lineHeight: 1.6 },
  availSection:{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" },
  availLabel:  { margin: 0, fontSize: "11px", fontWeight: "600", color: "#374151", width: "100%" },
  availPill:   { padding: "3px 10px", borderRadius: "20px", backgroundColor: "#f0fdf4", color: "#16a34a", fontSize: "11px", border: "1px solid #bbf7d0" },
  cardFooter:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" },
  sessionsText:{ fontSize: "11px", color: "#9ca3af" },
  bookBtn:     { padding: "8px 18px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "13px", fontWeight: "500" },

  // Booking panel
  bookingPanel:{ maxWidth: "640px" },
  backBtn:     { background: "none", border: "none", color: "#818cf8", cursor: "pointer", fontSize: "13px", padding: "0 0 16px", display: "block" },
  bookingCard: { backgroundColor: "white", borderRadius: "12px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  counsellorSummary: { display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "20px" },
  avatarLg:    { width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#ede9fe", color: "#6d28d9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "18px", flexShrink: 0 },
  divider:     { borderTop: "1px solid #f3f4f6", margin: "20px 0" },
  fieldLabel:  { margin: "0 0 10px", fontSize: "13px", fontWeight: "600", color: "#374151" },
  dateInput:   { padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", outline: "none", width: "100%", boxSizing: "border-box" },
  timeGrid:    { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" },
  timeSlot:       { padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "white", color: "#374151", cursor: "pointer", fontSize: "12px", textAlign: "center" },
  timeSlotActive: { padding: "10px", borderRadius: "8px", border: "1px solid #818cf8", backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "12px", textAlign: "center" },

  // Confirm section
  confirmSection: { marginTop: "24px", backgroundColor: "#f5f3ff", borderRadius: "10px", padding: "16px 20px" },
  confirmSummary: { marginBottom: "16px" },
  confirmText:    { margin: "4px 0", fontSize: "13px", color: "#374151" },
  confirmBtn:     { width: "100%", padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: "500" },

  // Confirmed screen
  confirmedScreen: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" },
  confirmedCard:   { backgroundColor: "white", borderRadius: "16px", padding: "40px", maxWidth: "480px", width: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", textAlign: "center" },
  successIcon:     { width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "bold", margin: "0 auto 20px" },
  confirmedTitle:  { margin: "0 0 8px", fontSize: "20px", fontWeight: "bold", color: "#111827" },
  confirmedText:   { margin: "0 0 24px", fontSize: "14px", color: "#6b7280" },
  confirmedDetails:{ backgroundColor: "#f9fafb", borderRadius: "10px", padding: "16px", marginBottom: "20px", textAlign: "left" },
  detailRow:       { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: "13px" },
  detailLabel:     { color: "#9ca3af" },
  detailValue:     { color: "#111827", fontWeight: "500" },
  reminderText:    { fontSize: "12px", color: "#9ca3af", marginBottom: "24px" },
  confirmedBtns:   { display: "flex", gap: "12px" },
  dashboardBtn:    { flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "13px" },
  bookAnotherBtn:  { flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #818cf8", backgroundColor: "white", color: "#818cf8", cursor: "pointer", fontSize: "13px" },
};

export default AppointmentBooking;
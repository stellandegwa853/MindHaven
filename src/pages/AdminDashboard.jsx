import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/auth";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const GRID = "rgba(136,135,128,0.12)";
const TICK = "#888780";
const TF   = { size: 11 };
const PU   = "#818cf8";
const PUL  = "#c7d2fe";

function useChart(ref, buildConfig) {
  useEffect(() => {
    if (!ref.current) return;
    const chart = new Chart(ref.current, buildConfig());
    return () => chart.destroy();
  }, []);
}

function SessionsLine() {
  const r = useRef(null);
  useChart(r, () => ({
    type: "line",
    data: {
      labels: ["Wk1","Wk2","Wk3","Wk4","Wk5","Wk6","Wk7","Wk8"],
      datasets: [{ data: [12,18,14,22,19,25,17,27], borderColor: PU,
        backgroundColor: "rgba(129,140,248,0.08)", borderWidth: 2,
        pointRadius: 3, pointBackgroundColor: PU, tension: 0.4, fill: true }],
    },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: TF, color: TICK } },
        y: { grid: { color: GRID }, ticks: { font: TF, color: TICK }, border: { display: false } },
      },
    },
  }));
  return <canvas ref={r} />;
}

function RiskStackedBar() {
  const r = useRef(null);
  useChart(r, () => ({
    type: "bar",
    data: {
      labels: ["Oct","Nov","Dec","Jan","Feb","Mar"],
      datasets: [
        { label: "High",   data: [1,2,1,3,2,2], backgroundColor: "#ef4444", borderRadius: 3, barPercentage: 0.6 },
        { label: "Medium", data: [2,3,2,4,3,3], backgroundColor: "#f97316", borderRadius: 3, barPercentage: 0.6 },
        { label: "Low",    data: [3,2,4,2,3,1], backgroundColor: PUL,       borderRadius: 3, barPercentage: 0.6 },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: TF, color: TICK, autoSkip: false } },
        y: { stacked: true, grid: { color: GRID }, ticks: { font: TF, color: TICK }, border: { display: false } },
      },
    },
  }));
  return <canvas ref={r} />;
}

function PeakHoursBar() {
  const r = useRef(null);
  useChart(r, () => ({
    type: "bar",
    data: {
      labels: ["6am","8am","10am","12pm","2pm","4pm","6pm","8pm","10pm"],
      datasets: [{
        data: [4,12,28,22,35,40,30,18,8],
        backgroundColor: ["#c7d2fe","#a5b4fc",PU,"#a5b4fc",PU,PU,PU,"#a5b4fc","#c7d2fe"],
        borderRadius: 4, barPercentage: 0.65,
      }],
    },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: TF, color: TICK, autoSkip: false } },
        y: { grid: { color: GRID }, border: { display: false }, ticks: { font: TF, color: TICK } },
      },
    },
  }));
  return <canvas ref={r} />;
}

function RegistrationsLine() {
  const r = useRef(null);
  useChart(r, () => ({
    type: "line",
    data: {
      labels: ["Oct","Nov","Dec","Jan","Feb","Mar"],
      datasets: [{ data: [18,24,15,42,38,52], borderColor: "#16a34a",
        backgroundColor: "rgba(22,163,74,0.07)", borderWidth: 2,
        pointRadius: 4, pointBackgroundColor: "#16a34a", tension: 0.35, fill: true }],
    },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: TF, color: TICK } },
        y: { grid: { color: GRID }, ticks: { font: TF, color: TICK }, border: { display: false } },
      },
    },
  }));
  return <canvas ref={r} />;
}

function RolesDoughnut() {
  const r = useRef(null);
  useChart(r, () => ({
    type: "doughnut",
    data: {
      labels: ["Students","Counsellors","Admins"],
      datasets: [{ data: [250,22,12], backgroundColor: [PU,"#16a34a","#888780"], borderWidth: 0, hoverOffset: 4 }],
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: "68%",
      plugins: { legend: { display: false } } },
  }));
  return <canvas ref={r} />;
}

function ApptDoughnut() {
  const r = useRef(null);
  useChart(r, () => ({
    type: "doughnut",
    data: {
      labels: ["Completed","Confirmed","Pending","Cancelled"],
      datasets: [{ data: [56,21,15,8], backgroundColor: ["#16a34a",PU,"#facc15","#ef4444"], borderWidth: 0, hoverOffset: 4 }],
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: "65%",
      plugins: { legend: { display: false } } },
  }));
  return <canvas ref={r} />;
}

function CounsellorBar() {
  const r = useRef(null);
  useChart(r, () => ({
    type: "bar",
    data: {
      labels: ["Alex","Brenda","Carlos","Diana","Eric","Faith"],
      datasets: [{ data: [18,14,22,11,17,9], backgroundColor: PU, borderRadius: 4, barPercentage: 0.6 }],
    },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: TF, color: TICK, autoSkip: false } },
        y: { grid: { color: GRID }, ticks: { font: TF, color: TICK }, border: { display: false } },
      },
    },
  }));
  return <canvas ref={r} />;
}

function MoodBar() {
  const r = useRef(null);
  useChart(r, () => ({
    type: "bar",
    data: {
      labels: ["Great","Good","Okay","Low","Very Low"],
      datasets: [{ data: [52,68,45,28,12],
        backgroundColor: ["#16a34a","#65a30d","#ca8a04","#ea580c","#dc2626"],
        borderRadius: 4, barPercentage: 0.55 }],
    },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: TF, color: TICK } },
        y: { grid: { color: GRID }, ticks: { font: TF, color: TICK }, border: { display: false } },
      },
    },
  }));
  return <canvas ref={r} />;
}

function Legend({ items }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
      {items.map(([color, label]) => (
        <span key={label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#6b7280" }}>
          <span style={{ width: "9px", height: "9px", borderRadius: "2px", backgroundColor: color, flexShrink: 0 }} />
          {label}
        </span>
      ))}
    </div>
  );
}

function ChartCard({ title, sub, height = 180, legend, children }) {
  return (
    <div style={S.chartCard}>
      <p style={S.chartTitle}>{title}</p>
      {sub && <p style={S.chartSub}>{sub}</p>}
      {legend && <Legend items={legend} />}
      <div style={{ position: "relative", width: "100%", height }}>
        {children}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]       = useState("overview");
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [userSearch, setUserSearch]     = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  const handleLogout = () => { logoutUser(); navigate("/login"); };

  const users = [
    { id: 1, name: "Amara Osei",    email: "amara@usiu.ac.ke",   role: "student", status: "active"    },
    { id: 2, name: "Brian Mwangi",  email: "brian@usiu.ac.ke",   role: "student", status: "active"    },
    { id: 3, name: "Cynthia Weru",  email: "cynthia@usiu.ac.ke", role: "student", status: "suspended" },
    { id: 4, name: "Daniel Otieno", email: "daniel@usiu.ac.ke",  role: "student", status: "active"    },
    { id: 5, name: "Esther Kamau",  email: "esther@usiu.ac.ke",  role: "student", status: "active"    },
  ];

  const counsellors = [
    { id: 6, name: "Faith Njeri",    email: "faith@usiu.ac.ke",   specialization: "Anxiety & Stress",  status: "verified", sessions: 22 },
    { id: 7, name: "George Kiprop",  email: "george@usiu.ac.ke",  specialization: "Academic Pressure", status: "verified", sessions: 18 },
    { id: 8, name: "Hannah Achieng", email: "hannah@usiu.ac.ke",  specialization: "Depression",        status: "pending",  sessions: 0  },
    { id: 9, name: "Isaac Mutua",    email: "isaac@usiu.ac.ke",   specialization: "Grief & Loss",      status: "pending",  sessions: 0  },
  ];

  const resources = [
    { id: 1, title: "Understanding Anxiety",    type: "article",       status: "published" },
    { id: 2, title: "Managing Academic Stress", type: "article",       status: "published" },
    { id: 3, title: "Mindfulness Basics",       type: "video",         status: "published" },
    { id: 4, title: "Crisis Helplines Kenya",   type: "external_link", status: "published" },
    { id: 5, title: "Sleep & Mental Health",    type: "article",       status: "draft"     },
  ];

  const riskFlags = [
    { id: 1, student: "Anonymous Student", source: "message", level: "high",   date: "14 Mar 2026", reviewed: false },
    { id: 2, student: "Anonymous Student", source: "journal", level: "medium", date: "10 Mar 2026", reviewed: false },
    { id: 3, student: "Anonymous Student", source: "message", level: "low",    date: "05 Mar 2026", reviewed: true  },
  ];

  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = selectedRole === "all" || u.role === selectedRole;
    return matchSearch && matchRole;
  });

  const renderOverview = () => (
    <>
      <div style={S.cardContainer}>
        {[
          { label: "Total Users",         value: "284", sub: "↑ 12 this week",      color: PU        },
          { label: "Active Counsellors",  value: "11",  sub: "2 pending approval",  color: PU        },
          { label: "Sessions This Month", value: "137", sub: "↑ 18% vs last month", color: PU        },
          { label: "Risk Flags",          value: "6",   sub: "2 unreviewed",         color: "#dc2626" },
        ].map((c) => (
          <div key={c.label} style={S.summaryCard}>
            <h3 style={S.summaryCardTitle}>{c.label}</h3>
            <p style={{ ...S.cardNumber, color: c.color }}>{c.value}</p>
            <p style={S.cardSub}>{c.sub}</p>
          </div>
        ))}
      </div>

      <div style={S.chartsRow2}>
        <ChartCard title="Session activity" sub="Last 8 weeks">
          <SessionsLine />
        </ChartCard>
        <ChartCard title="Risk flags by severity" sub="Last 6 months"
          legend={[["#ef4444","High"],["#f97316","Medium"],[PUL,"Low"]]}>
          <RiskStackedBar />
        </ChartCard>
      </div>

      <div style={S.chartsRow2}>
        <ChartCard title="Peak usage hours" sub="Sessions per time slot" height={150}>
          <PeakHoursBar />
        </ChartCard>
        <ChartCard title="User roles" sub="284 total users" height={120}
          legend={[[PU,"Students 88%"],["#16a34a","Counsellors 8%"],["#888780","Admins 4%"]]}>
          <RolesDoughnut />
        </ChartCard>
      </div>
    </>
  );

  const renderAnalytics = () => (
    <>
      <h3 style={{ ...S.sectionTitle, marginBottom: "20px" }}>Platform Analytics</h3>
      <div style={S.chartsRow2}>
        <ChartCard title="New registrations" sub="Students joining per month" height={200}>
          <RegistrationsLine />
        </ChartCard>
        <ChartCard title="Appointment status" sub="All-time breakdown" height={160}
          legend={[["#16a34a","Completed 56%"],[PU,"Confirmed 21%"],["#facc15","Pending 15%"],["#ef4444","Cancelled 8%"]]}>
          <ApptDoughnut />
        </ChartCard>
      </div>
      <div style={S.chartsRow2}>
        <ChartCard title="Peak usage hours" sub="Average sessions per time slot" height={200}>
          <PeakHoursBar />
        </ChartCard>
        <ChartCard title="Risk flags over time" sub="Stacked by severity — last 6 months" height={200}
          legend={[["#ef4444","High"],["#f97316","Medium"],[PUL,"Low"]]}>
          <RiskStackedBar />
        </ChartCard>
      </div>
      <div style={S.chartsRow2}>
        <ChartCard title="Sessions per counsellor" sub="All-time totals" height={200}>
          <CounsellorBar />
        </ChartCard>
        <ChartCard title="Student mood distribution" sub="Entries logged this month" height={200}>
          <MoodBar />
        </ChartCard>
      </div>
      <ChartCard title="User roles breakdown" sub="284 registered users" height={180}
        legend={[[PU,"Students 88%"],["#16a34a","Counsellors 8%"],["#888780","Admins 4%"]]}>
        <RolesDoughnut />
      </ChartCard>
      <div style={{ ...S.statsGrid, marginTop: "16px" }}>
        {[
          { label: "Avg session duration",   value: "23 mins" },
          { label: "Risk detection rate",    value: "4.2%"    },
          { label: "Counsellor utilisation", value: "74%"     },
          { label: "Journal entries / user", value: "6.3"     },
          { label: "Repeat session rate",    value: "61%"     },
        ].map((s) => (
          <div key={s.label} style={S.statCard}>
            <p style={S.statLabel}>{s.label}</p>
            <p style={S.statValue}>{s.value}</p>
          </div>
        ))}
      </div>
    </>
  );

  const renderUsers = () => (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Manage Students</h3>
      <div style={S.filterRow}>
        <input style={S.searchInput} placeholder="Search by name or email..."
          value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
        <select style={S.selectInput} value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
          <option value="all">All roles</option>
          <option value="student">Students</option>
          <option value="counsellor">Counsellors</option>
        </select>
      </div>
      <div style={S.tableWrapper}>
        <table style={S.table}>
          <thead>
            <tr style={S.tableHead}>
              {["Name","Email","Role","Status","Actions"].map((h) => <th key={h} style={S.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} style={S.tableRow}>
                <td style={S.td}>{u.name}</td>
                <td style={S.td}>{u.email}</td>
                <td style={S.td}><span style={S.roleBadge}>{u.role}</span></td>
                <td style={S.td}><span style={u.status === "active" ? S.statusActive : S.statusSuspended}>{u.status}</span></td>
                <td style={S.td}>
                  <div style={S.actionButtons}>
                    <button style={S.smallButton}>Edit</button>
                    <button style={S.smallDangerButton}>{u.status === "active" ? "Suspend" : "Reinstate"}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCounsellors = () => (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>Manage Counsellors</h3>
      {counsellors.map((c) => (
        <div key={c.id} style={S.clientCard}>
          <div>
            <p style={S.clientName}>{c.name}</p>
            <p style={S.clientSub}>{c.specialization} · {c.sessions} sessions · {c.email}</p>
          </div>
          <div style={S.actionButtons}>
            <span style={c.status === "verified" ? S.statusActive : S.statusPending}>{c.status}</span>
            {c.status === "pending"  && <button style={S.approveButton}>Approve</button>}
            {c.status === "verified" && <button style={S.smallDangerButton}>Suspend</button>}
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => (
    <div style={S.section}>
      <div style={S.sectionHeader}>
        <h3 style={S.sectionTitle}>Mental Health Resources</h3>
        <button style={S.primaryButton}>+ Add Resource</button>
      </div>
      {resources.map((r) => (
        <div key={r.id} style={S.clientCard}>
          <div>
            <p style={S.clientName}>{r.title}</p>
            <p style={S.clientSub}>{r.type}</p>
          </div>
          <div style={S.actionButtons}>
            <span style={r.status === "published" ? S.statusActive : S.statusPending}>{r.status}</span>
            <button style={S.smallButton}>Edit</button>
            <button style={S.smallDangerButton}>{r.status === "published" ? "Unpublish" : "Publish"}</button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRiskFlags = () => (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>All Risk Flags</h3>
      {riskFlags.map((f) => (
        <div key={f.id} style={S.clientCard}>
          <div>
            <p style={S.clientName}>{f.student}</p>
            <p style={S.clientSub}>Source: {f.source} · {f.date}</p>
          </div>
          <div style={S.actionButtons}>
            <span style={f.level === "high" ? S.badgeHigh : f.level === "medium" ? S.badgeMedium : S.badgeLow}>
              {f.level}
            </span>
            <span style={f.reviewed ? S.statusActive : S.statusPending}>
              {f.reviewed ? "reviewed" : "pending"}
            </span>
            {!f.reviewed && <button style={S.primaryButton}>Mark Reviewed</button>}
          </div>
        </div>
      ))}
    </div>
  );

  const tabs = [
    { key: "overview",    label: "Overview"    },
    { key: "analytics",  label: "Analytics"   },
    { key: "users",      label: "Students"    },
    { key: "counsellors",label: "Counsellors" },
    { key: "content",    label: "Resources"   },
    { key: "risk",       label: "Risk Flags"  },
  ];

  return (
    <div style={S.container}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={S.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div style={{ ...S.sidebar, transform: sidebarOpen ? "translateX(0)" : undefined }}>
        <h2 style={S.logo}>Mind Haven</h2>
        {tabs.map((t) => (
          <button key={t.key}
            style={activeTab === t.key ? S.navButtonActive : S.navButton}
            onClick={() => { setActiveTab(t.key); setSidebarOpen(false); }}>
            {t.label}
          </button>
        ))}
        <button style={S.logoutButton} onClick={handleLogout}>Logout</button>
      </div>

      {/* Main content */}
      <div style={S.mainContent}>

        {/* Mobile topbar */}
        <div style={S.mobileTopbar}>
          <button style={S.hamburger} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <span style={S.mobileTitle}>Admin Dashboard</span>
        </div>

        <h1 style={S.title}>Admin Dashboard</h1>
        {activeTab === "overview"    && renderOverview()}
        {activeTab === "analytics"  && renderAnalytics()}
        {activeTab === "users"       && renderUsers()}
        {activeTab === "counsellors" && renderCounsellors()}
        {activeTab === "content"     && renderContent()}
        {activeTab === "risk"        && renderRiskFlags()}
      </div>
    </div>
  );
}

const S = {
  container:       { display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif", position: "relative" },
  overlay:         { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 40 },
  sidebar: {
    width: "240px", backgroundColor: "#111827", color: "white",
    display: "flex", flexDirection: "column", padding: "25px 20px", gap: "10px",
    position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 50,
    transition: "transform 0.3s ease",
    ["@media (max-width: 768px)"]: { transform: "translateX(-100%)" },
  },
  logo:            { fontSize: "20px", marginBottom: "20px" },
  navButton:       { padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "#9ca3af", cursor: "pointer", textAlign: "left", fontSize: "14px" },
  navButtonActive: { padding: "10px", borderRadius: "8px", border: "none", backgroundColor: PU, color: "white", cursor: "pointer", textAlign: "left", fontSize: "14px" },
  logoutButton:    { marginTop: "auto", padding: "10px", borderRadius: "8px", border: "1px solid #4b5563", backgroundColor: "transparent", color: "white", cursor: "pointer" },

  mainContent:  { flex: 1, padding: "36px 40px", backgroundColor: "#f3f4f6", overflowY: "auto", marginLeft: "240px" },
  title:        { marginBottom: "28px", fontSize: "24px", fontWeight: "bold", display: "none" },

  mobileTopbar: { display: "none", alignItems: "center", gap: "12px", marginBottom: "20px", padding: "12px 0" },
  hamburger:    { background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#111827" },
  mobileTitle:  { fontSize: "18px", fontWeight: "bold", color: "#111827" },

  cardContainer:    { display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" },
  summaryCard:      { backgroundColor: "white", padding: "20px 24px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", minWidth: "140px", flex: "1" },
  summaryCardTitle: { fontSize: "12px", color: "#6b7280", margin: "0 0 8px", fontWeight: "500" },
  cardNumber:       { fontSize: "28px", fontWeight: "bold", margin: "0" },
  cardSub:          { fontSize: "12px", color: "#9ca3af", margin: "6px 0 0" },

  chartsRow2: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "16px", marginBottom: "16px" },
  chartCard:  { backgroundColor: "white", border: "1px solid #f3f4f6", borderRadius: "12px", padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  chartTitle: { fontSize: "13px", fontWeight: "600", color: "#374151", margin: "0 0 2px" },
  chartSub:   { fontSize: "11px", color: "#9ca3af", margin: "0 0 10px" },

  statsGrid:  { display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "12px", marginBottom: "32px" },
  statCard:   { backgroundColor: "white", padding: "16px 18px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  statLabel:  { fontSize: "12px", color: "#6b7280", margin: "0 0 6px" },
  statValue:  { fontSize: "22px", fontWeight: "bold", color: PU, margin: 0 },

  section:       { marginBottom: "36px" },
  sectionTitle:  { fontSize: "15px", fontWeight: "600", marginBottom: "14px", color: "#111827" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" },

  clientCard:   { backgroundColor: "white", padding: "14px 18px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 3px 8px rgba(0,0,0,0.03)", marginBottom: "10px", flexWrap: "wrap", gap: "10px" },
  clientName:   { margin: 0, fontWeight: "600", fontSize: "14px" },
  clientSub:    { margin: "3px 0 0", fontSize: "12px", color: "#6b7280" },
  actionButtons:{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" },

  primaryButton:     { padding: "8px 14px", borderRadius: "8px", border: "none", backgroundColor: PU, color: "white", cursor: "pointer", fontSize: "13px" },
  approveButton:     { padding: "7px 13px", borderRadius: "8px", border: "none", backgroundColor: "#16a34a", color: "white", cursor: "pointer", fontSize: "13px" },
  rejectButton:      { padding: "7px 13px", borderRadius: "8px", border: "1px solid #dc2626", backgroundColor: "transparent", color: "#dc2626", cursor: "pointer", fontSize: "13px" },
  smallButton:       { padding: "6px 12px", borderRadius: "8px", border: `1px solid ${PU}`, backgroundColor: "white", color: PU, cursor: "pointer", fontSize: "12px" },
  smallDangerButton: { padding: "6px 12px", borderRadius: "8px", border: "1px solid #dc2626", backgroundColor: "white", color: "#dc2626", cursor: "pointer", fontSize: "12px" },

  statusActive:    { padding: "3px 10px", borderRadius: "20px", backgroundColor: "#dcfce7", color: "#16a34a", fontSize: "12px", fontWeight: "500" },
  statusSuspended: { padding: "3px 10px", borderRadius: "20px", backgroundColor: "#fee2e2", color: "#dc2626", fontSize: "12px", fontWeight: "500" },
  statusPending:   { padding: "3px 10px", borderRadius: "20px", backgroundColor: "#fef9c3", color: "#ca8a04", fontSize: "12px", fontWeight: "500" },
  roleBadge:       { padding: "3px 10px", borderRadius: "20px", backgroundColor: "#ede9fe", color: "#6d28d9", fontSize: "12px", fontWeight: "500" },
  badgeHigh:       { padding: "3px 10px", borderRadius: "20px", backgroundColor: "#fee2e2", color: "#dc2626", fontSize: "12px", fontWeight: "500" },
  badgeMedium:     { padding: "3px 10px", borderRadius: "20px", backgroundColor: "#fef9c3", color: "#ca8a04", fontSize: "12px", fontWeight: "500" },
  badgeLow:        { padding: "3px 10px", borderRadius: "20px", backgroundColor: "#dcfce7", color: "#16a34a", fontSize: "12px", fontWeight: "500" },

  filterRow:   { display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" },
  searchInput: { flex: 1, minWidth: "200px", padding: "9px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", outline: "none" },
  selectInput: { padding: "9px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", backgroundColor: "white", outline: "none" },
  tableWrapper:{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.03)", overflow: "auto" },
  table:       { width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "500px" },
  tableHead:   { backgroundColor: "#f9fafb" },
  th:          { padding: "12px 16px", textAlign: "left", fontWeight: "600", color: "#374151", borderBottom: "1px solid #e5e7eb" },
  tableRow:    { borderBottom: "1px solid #f3f4f6" },
  td:          { padding: "12px 16px", color: "#374151", verticalAlign: "middle" },
};

export default AdminDashboard;
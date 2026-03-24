import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../utils/auth";

const MOODS = [
  { label: "Great", emoji: "😄", color: "#16a34a", bg: "#dcfce7" },
  { label: "Good",  emoji: "🙂", color: "#65a30d", bg: "#ecfccb" },
  { label: "Okay",  emoji: "😐", color: "#ca8a04", bg: "#fef9c3" },
  { label: "Low",   emoji: "😔", color: "#ea580c", bg: "#ffedd5" },
  { label: "Bad",   emoji: "😢", color: "#dc2626", bg: "#fee2e2" },
];

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

const SAMPLE_ENTRIES = [
  {
    id: 1,
    title: "First week reflections",
    body: "It has been a hectic first week back. Classes are picking up fast and I am feeling the pressure already. Spoke to a peer counsellor today which helped me put things in perspective. I need to work on my time management.",
    mood: "Okay",
    createdAt: "2026-03-02T09:15:00",
  },
  {
    id: 2,
    title: "A better day",
    body: "Today felt lighter. I finished my assignment early and had time to take a walk around campus. Small wins matter. I also called my mum which always helps.",
    mood: "Good",
    createdAt: "2026-03-05T19:40:00",
  },
  {
    id: 3,
    title: "Struggling with focus",
    body: "Can't seem to concentrate today. I've read the same paragraph five times. Going to try the box breathing exercise from the resources page and see if that helps.",
    mood: "Low",
    createdAt: "2026-03-10T14:22:00",
  },
  {
    id: 4,
    title: "Great counselling session",
    body: "Had a really productive session with my peer counsellor. We talked about my anxiety around exams and she gave me a few strategies to try. Feeling hopeful.",
    mood: "Great",
    createdAt: "2026-03-14T11:05:00",
  },
];

let nextId = 5;

function Journal() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [entries, setEntries]         = useState(SAMPLE_ENTRIES);
  const [selectedId, setSelectedId]   = useState(SAMPLE_ENTRIES[3].id);
  const [mode, setMode]               = useState("view");   // "view" | "edit" | "new"
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // editor state
  const [draftTitle, setDraftTitle]   = useState("");
  const [draftBody,  setDraftBody]    = useState("");
  const [draftMood,  setDraftMood]    = useState(null);

  const selectedEntry = entries.find((e) => e.id === selectedId) || null;

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Chat",      path: "/chat"      },
    { label: "Resources", path: "/resources" },
    { label: "Journal",   path: "/journal"   },
  ];

  // ── actions ────────────────────────────────────────────────────────────────
  const openNew = () => {
    setDraftTitle("");
    setDraftBody("");
    setDraftMood(null);
    setSelectedId(null);
    setMode("new");
  };

  const openEdit = (entry) => {
    setDraftTitle(entry.title);
    setDraftBody(entry.body);
    setDraftMood(entry.mood);
    setMode("edit");
  };

  const cancelEdit = () => {
    setMode("view");
    if (!selectedEntry && entries.length > 0) setSelectedId(entries[0].id);
  };

  const saveNew = () => {
    if (!draftTitle.trim() && !draftBody.trim()) return;
    const entry = {
      id: nextId++,
      title: draftTitle.trim() || "Untitled",
      body: draftBody.trim(),
      mood: draftMood,
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [entry, ...prev]);
    setSelectedId(entry.id);
    setMode("view");
    // TODO: POST /api/journal { title, body, mood }
  };

  const saveEdit = () => {
    if (!draftTitle.trim() && !draftBody.trim()) return;
    setEntries((prev) =>
      prev.map((e) =>
        e.id === selectedId
          ? { ...e, title: draftTitle.trim() || "Untitled", body: draftBody.trim(), mood: draftMood }
          : e
      )
    );
    setMode("view");
    // TODO: PUT /api/journal/:id { title, body, mood }
  };

  const deleteEntry = (id) => {
    const remaining = entries.filter((e) => e.id !== id);
    setEntries(remaining);
    setDeleteConfirmId(null);
    setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    setMode("view");
    // TODO: DELETE /api/journal/:id
  };

  const handleLogout = () => { logoutUser(); navigate("/login"); };

  // ── right panel content ────────────────────────────────────────────────────
  const renderEditor = () => {
    const isNew  = mode === "new";
    const label  = isNew ? "New entry" : "Edit entry";
    return (
      <div style={S.editorPanel}>
        <div style={S.editorHeader}>
          <p style={S.editorLabel}>{label}</p>
          <button style={S.cancelBtn} onClick={cancelEdit}>Cancel</button>
        </div>

        <input
          style={S.titleInput}
          placeholder="Entry title..."
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
        />

        {/* Mood selector */}
        <p style={S.moodLabel}>How are you feeling?</p>
        <div style={S.moodRow}>
          {MOODS.map((m) => (
            <button
              key={m.label}
              onClick={() => setDraftMood(draftMood === m.label ? null : m.label)}
              style={{
                ...S.moodBtn,
                border: draftMood === m.label ? `2px solid ${m.color}` : "2px solid transparent",
                backgroundColor: draftMood === m.label ? m.bg : "transparent",
              }}
            >
              <span style={{ fontSize: "22px" }}>{m.emoji}</span>
              <span style={{ fontSize: "10px", color: "#6b7280" }}>{m.label}</span>
            </button>
          ))}
        </div>

        <textarea
          style={S.bodyInput}
          rows={12}
          placeholder="Write freely — this is your private space..."
          value={draftBody}
          onChange={(e) => setDraftBody(e.target.value)}
        />

        <button
          style={(draftTitle.trim() || draftBody.trim()) ? S.saveBtn : S.saveBtnDisabled}
          onClick={isNew ? saveNew : saveEdit}
        >
          Save Entry
        </button>
      </div>
    );
  };

  const renderView = () => {
    if (!selectedEntry) {
      return (
        <div style={S.emptyRight}>
          <p style={S.emptyIcon}>📓</p>
          <p style={S.emptyTitle}>No entries yet</p>
          <p style={S.emptyText}>Write your first journal entry to get started.</p>
          <button style={S.newEntryBtn} onClick={openNew}>+ New Entry</button>
        </div>
      );
    }

    const mood = MOODS.find((m) => m.label === selectedEntry.mood);

    return (
      <div style={S.viewPanel}>
        <div style={S.viewHeader}>
          <div>
            <h2 style={S.viewTitle}>{selectedEntry.title}</h2>
            <div style={S.viewMeta}>
              <span>{formatDate(selectedEntry.createdAt)} at {formatTime(selectedEntry.createdAt)}</span>
              {mood && (
                <span style={{ ...S.moodBadge, backgroundColor: mood.bg, color: mood.color }}>
                  {mood.emoji} {mood.label}
                </span>
              )}
            </div>
          </div>
          <div style={S.viewActions}>
            <button style={S.editBtn} onClick={() => openEdit(selectedEntry)}>Edit</button>
            <button style={S.deleteBtn} onClick={() => setDeleteConfirmId(selectedEntry.id)}>Delete</button>
          </div>
        </div>

        <div style={S.divider} />
        <p style={S.viewBody}>{selectedEntry.body}</p>

        {/* Delete confirm */}
        {deleteConfirmId === selectedEntry.id && (
          <div style={S.confirmBox}>
            <p style={S.confirmText}>Are you sure you want to delete this entry? This cannot be undone.</p>
            <div style={S.confirmBtns}>
              <button style={S.confirmDelete} onClick={() => deleteEntry(selectedEntry.id)}>Yes, delete</button>
              <button style={S.confirmCancel} onClick={() => setDeleteConfirmId(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  };

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

      {/* Page body */}
      <div style={S.pageBody}>

        {/* Left — entry list */}
        <div style={S.leftPanel}>
          <div style={S.leftHeader}>
            <p style={S.leftTitle}>My Journal</p>
            <button style={S.newEntryBtn} onClick={openNew}>+ New</button>
          </div>

          {entries.length === 0 && (
            <p style={S.noEntries}>No entries yet.</p>
          )}

          {entries.map((e) => {
            const mood    = MOODS.find((m) => m.label === e.mood);
            const active  = selectedId === e.id && mode !== "new";
            return (
              <div
                key={e.id}
                style={{ ...S.entryItem, ...(active ? S.entryItemActive : {}) }}
                onClick={() => { setSelectedId(e.id); setMode("view"); }}
              >
                <div style={S.entryItemTop}>
                  <p style={S.entryItemTitle}>{e.title}</p>
                  {mood && <span style={{ fontSize: "14px" }}>{mood.emoji}</span>}
                </div>
                <p style={S.entryItemDate}>{formatDate(e.createdAt)}</p>
                <p style={S.entryItemPreview}>
                  {e.body.length > 80 ? e.body.slice(0, 80) + "…" : e.body}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right — view or editor */}
        <div style={S.rightPanel}>
          {mode === "view" || mode === "new" && !selectedEntry
            ? mode === "new" ? renderEditor() : renderView()
            : mode === "edit" ? renderEditor() : renderView()
          }
        </div>
      </div>
    </div>
  );
}

const S = {
  container: { display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" },

  // Sidebar
  sidebar:         { width: "240px", backgroundColor: "#111827", color: "white", display: "flex", flexDirection: "column", padding: "25px 20px", gap: "10px", flexShrink: 0 },
  logo:            { fontSize: "20px", marginBottom: "20px" },
  navButton:       { padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "#9ca3af", cursor: "pointer", textAlign: "left", fontSize: "14px" },
  navButtonActive: { padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", textAlign: "left", fontSize: "14px" },
  logoutButton:    { marginTop: "auto", padding: "10px", borderRadius: "8px", border: "1px solid #4b5563", backgroundColor: "transparent", color: "white", cursor: "pointer" },

  // Layout
  pageBody:   { display: "flex", flex: 1, overflow: "hidden", backgroundColor: "#f3f4f6" },

  // Left panel
  leftPanel:  { width: "300px", flexShrink: 0, backgroundColor: "white", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", overflowY: "auto" },
  leftHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 16px 14px", borderBottom: "1px solid #f3f4f6", position: "sticky", top: 0, backgroundColor: "white", zIndex: 1 },
  leftTitle:  { margin: 0, fontSize: "15px", fontWeight: "600", color: "#111827" },
  newEntryBtn:{ padding: "6px 14px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "12px", fontWeight: "500" },
  noEntries:  { padding: "20px 16px", fontSize: "13px", color: "#9ca3af" },

  entryItem: {
    padding: "14px 16px", borderBottom: "1px solid #f9fafb",
    cursor: "pointer", transition: "background 0.1s",
  },
  entryItemActive: { backgroundColor: "#f5f3ff", borderLeft: "3px solid #818cf8" },
  entryItemTop:    { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" },
  entryItemTitle:  { margin: 0, fontSize: "13px", fontWeight: "600", color: "#111827" },
  entryItemDate:   { margin: "0 0 5px", fontSize: "11px", color: "#9ca3af" },
  entryItemPreview:{ margin: 0, fontSize: "12px", color: "#6b7280", lineHeight: 1.5 },

  // Right panel
  rightPanel: { flex: 1, overflowY: "auto", padding: "32px 40px", backgroundColor: "#f3f4f6" },

  // View mode
  viewPanel:   { backgroundColor: "white", borderRadius: "12px", padding: "28px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  viewHeader:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" },
  viewTitle:   { margin: "0 0 8px", fontSize: "20px", fontWeight: "bold", color: "#111827" },
  viewMeta:    { display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "#9ca3af" },
  moodBadge:   { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" },
  viewActions: { display: "flex", gap: "8px", flexShrink: 0 },
  editBtn:     { padding: "7px 14px", borderRadius: "8px", border: "1px solid #818cf8", backgroundColor: "white", color: "#818cf8", cursor: "pointer", fontSize: "13px" },
  deleteBtn:   { padding: "7px 14px", borderRadius: "8px", border: "1px solid #dc2626", backgroundColor: "white", color: "#dc2626", cursor: "pointer", fontSize: "13px" },
  divider:     { borderTop: "1px solid #f3f4f6", margin: "16px 0" },
  viewBody:    { fontSize: "15px", color: "#374151", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" },

  // Confirm delete
  confirmBox:    { marginTop: "24px", backgroundColor: "#fff7f7", border: "1px solid #fecaca", borderRadius: "10px", padding: "16px 20px" },
  confirmText:   { margin: "0 0 14px", fontSize: "13px", color: "#dc2626" },
  confirmBtns:   { display: "flex", gap: "10px" },
  confirmDelete: { padding: "7px 16px", borderRadius: "8px", border: "none", backgroundColor: "#dc2626", color: "white", cursor: "pointer", fontSize: "13px" },
  confirmCancel: { padding: "7px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "white", color: "#374151", cursor: "pointer", fontSize: "13px" },

  // Editor mode
  editorPanel:  { backgroundColor: "white", borderRadius: "12px", padding: "28px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  editorHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  editorLabel:  { margin: 0, fontSize: "15px", fontWeight: "600", color: "#111827" },
  cancelBtn:    { padding: "6px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "white", color: "#6b7280", cursor: "pointer", fontSize: "13px" },
  titleInput:   { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "16px", fontWeight: "600", outline: "none", marginBottom: "20px", boxSizing: "border-box", fontFamily: "Arial, sans-serif" },
  moodLabel:    { margin: "0 0 10px", fontSize: "13px", color: "#374151", fontWeight: "500" },
  moodRow:      { display: "flex", gap: "8px", marginBottom: "20px" },
  moodBtn:      { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px 10px", borderRadius: "10px", cursor: "pointer", transition: "all 0.15s" },
  bodyInput:    { width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", lineHeight: 1.7, resize: "vertical", outline: "none", fontFamily: "Arial, sans-serif", marginBottom: "16px", boxSizing: "border-box" },
  saveBtn:         { padding: "10px 24px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: "500" },
  saveBtnDisabled: { padding: "10px 24px", borderRadius: "8px", border: "none", backgroundColor: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed", fontSize: "14px" },

  // Empty state
  emptyRight: { textAlign: "center", padding: "80px 20px" },
  emptyIcon:  { fontSize: "48px", margin: "0 0 16px" },
  emptyTitle: { fontSize: "18px", fontWeight: "600", color: "#374151", margin: "0 0 8px" },
  emptyText:  { fontSize: "14px", color: "#6b7280", margin: "0 0 24px" },
};

export default Journal;
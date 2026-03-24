import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../utils/auth";

function Resources() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeCategory, setActiveCategory] = useState("all");
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Chat",      path: "/chat"      },
    { label: "Resources", path: "/resources" },
    { label: "Journal",   path: "/journal"   },
  ];

  const categories = [
    { key: "all",       label: "All"          },
    { key: "anxiety",   label: "Anxiety"      },
    { key: "stress",    label: "Stress"       },
    { key: "depression",label: "Depression"   },
    { key: "wellbeing", label: "Wellbeing"    },
    { key: "crisis",    label: "Crisis Help"  },
  ];

  const resources = [
    {
      id: 1,
      title: "Understanding Anxiety",
      type: "article",
      category: "anxiety",
      description: "An introduction to anxiety, its causes, symptoms, and practical coping strategies for university students.",
      readTime: "5 min read",
      url: "#",
    },
    {
      id: 2,
      title: "Managing Academic Stress",
      type: "article",
      category: "stress",
      description: "Practical tips for dealing with exam pressure, deadlines, and the demands of university life.",
      readTime: "4 min read",
      url: "#",
    },
    {
      id: 3,
      title: "Mindfulness Basics",
      type: "video",
      category: "wellbeing",
      description: "A short guided mindfulness and breathing exercise to help you reset and refocus during a busy day.",
      readTime: "8 min watch",
      url: "#",
    },
    {
      id: 4,
      title: "Crisis Helplines Kenya",
      type: "external_link",
      category: "crisis",
      description: "A curated list of local mental health helplines including Befrienders Kenya and other support services.",
      readTime: "Reference",
      url: "https://www.befrienderskenya.org",
    },
    {
      id: 5,
      title: "Sleep & Mental Health",
      type: "article",
      category: "wellbeing",
      description: "How sleep affects your mood, focus, and emotional resilience — and how to build better sleep habits.",
      readTime: "6 min read",
      url: "#",
    },
    {
      id: 6,
      title: "Recognising Depression",
      type: "article",
      category: "depression",
      description: "Learn the signs of depression, how it differs from sadness, and when to seek professional support.",
      readTime: "5 min read",
      url: "#",
    },
    {
      id: 7,
      title: "Box Breathing Exercise",
      type: "video",
      category: "anxiety",
      description: "A simple 4-step breathing technique used to calm the nervous system during moments of anxiety or panic.",
      readTime: "4 min watch",
      url: "#",
    },
    {
      id: 8,
      title: "Self-Care Guide for Students",
      type: "article",
      category: "wellbeing",
      description: "Practical self-care routines — physical, emotional, and social — tailored for university students.",
      readTime: "7 min read",
      url: "#",
    },
    {
      id: 9,
      title: "Dealing with Grief & Loss",
      type: "article",
      category: "depression",
      description: "A compassionate guide to understanding grief, the stages of loss, and healthy ways to cope.",
      readTime: "6 min read",
      url: "#",
    },
    {
      id: 10,
      title: "5-Minute Stress Relief",
      type: "video",
      category: "stress",
      description: "A quick guided session combining light movement and breathing to release tension between classes.",
      readTime: "5 min watch",
      url: "#",
    },
    {
      id: 11,
      title: "Befrienders Kenya",
      type: "external_link",
      category: "crisis",
      description: "Confidential emotional support and suicide prevention helpline available in Kenya.",
      readTime: "External",
      url: "https://www.befrienderskenya.org",
    },
    {
      id: 12,
      title: "Shamiri Institute",
      type: "external_link",
      category: "crisis",
      description: "Evidence-based mental health support programs for young people across Kenya.",
      readTime: "External",
      url: "https://www.shamiri.institute",
    },
  ];

  const typeConfig = {
    article:       { label: "Article",       color: "#818cf8", bg: "#ede9fe" },
    video:         { label: "Video",         color: "#0891b2", bg: "#e0f2fe" },
    external_link: { label: "External Link", color: "#16a34a", bg: "#dcfce7" },
    self_help:     { label: "Self-Help",     color: "#ca8a04", bg: "#fef9c3" },
  };

  const toggleBookmark = (id) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const filtered = resources.filter((r) => {
    const matchCategory = activeCategory === "all" || r.category === activeCategory;
    const matchBookmark = showBookmarksOnly ? bookmarks.includes(r.id) : true;
    return matchCategory && matchBookmark;
  });

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
        <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Wellness Resources</h1>
            <p style={styles.subtitle}>Explore articles, videos, and support links curated for you.</p>
          </div>
          <button
            style={showBookmarksOnly ? styles.bookmarkFilterActive : styles.bookmarkFilter}
            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
          >
            {showBookmarksOnly ? "★ Saved" : "☆ Saved"} ({bookmarks.length})
          </button>
        </div>

        {/* Category Tabs */}
        <div style={styles.tabRow}>
          {categories.map((cat) => (
            <button
              key={cat.key}
              style={activeCategory === cat.key ? styles.tabActive : styles.tab}
              onClick={() => { setActiveCategory(cat.key); setShowBookmarksOnly(false); }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p style={styles.resultCount}>
          {filtered.length} {filtered.length === 1 ? "resource" : "resources"}
          {showBookmarksOnly ? " saved" : activeCategory !== "all" ? ` in ${categories.find(c => c.key === activeCategory)?.label}` : " available"}
        </p>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>☆</p>
            <p style={styles.emptyTitle}>No saved resources yet</p>
            <p style={styles.emptyText}>Bookmark resources by clicking the star icon on any card.</p>
            <button style={styles.primaryButton} onClick={() => setShowBookmarksOnly(false)}>
              Browse all resources
            </button>
          </div>
        )}

        {/* Resource Grid */}
        <div style={styles.grid}>
          {filtered.map((r) => {
            const type  = typeConfig[r.type] || typeConfig.article;
            const saved = bookmarks.includes(r.id);
            return (
              <div key={r.id} style={styles.card}>

                {/* Card header */}
                <div style={styles.cardTop}>
                  <span style={{ ...styles.typeBadge, backgroundColor: type.bg, color: type.color }}>
                    {type.label}
                  </span>
                  <button
                    style={styles.bookmarkBtn}
                    onClick={() => toggleBookmark(r.id)}
                    title={saved ? "Remove bookmark" : "Save resource"}
                  >
                    <span style={{ color: saved ? "#818cf8" : "#d1d5db", fontSize: "18px" }}>
                      {saved ? "★" : "☆"}
                    </span>
                  </button>
                </div>

                {/* Card body */}
                <h3 style={styles.cardTitle}>{r.title}</h3>
                <p style={styles.cardDesc}>{r.description}</p>

                {/* Card footer */}
                <div style={styles.cardFooter}>
                  <span style={styles.readTime}>{r.readTime}</span>
                  <a
                    href={r.url}
                    target={r.type === "external_link" ? "_blank" : "_self"}
                    rel="noreferrer"
                    style={styles.readLink}
                  >
                    {r.type === "video" ? "Watch →" : r.type === "external_link" ? "Visit →" : "Read →"}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" },

  // Sidebar
  sidebar: {
    width: "240px", backgroundColor: "#111827", color: "white",
    display: "flex", flexDirection: "column", padding: "25px 20px", gap: "10px",
  },
  logo:            { fontSize: "20px", marginBottom: "20px" },
  navButton:       { padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "#9ca3af", cursor: "pointer", textAlign: "left", fontSize: "14px" },
  navButtonActive: { padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#818cf8", color: "white", cursor: "pointer", textAlign: "left", fontSize: "14px" },
  logoutButton:    { marginTop: "auto", padding: "10px", borderRadius: "8px", border: "1px solid #4b5563", backgroundColor: "transparent", color: "white", cursor: "pointer" },

  // Main
  mainContent: { flex: 1, padding: "36px 40px", backgroundColor: "#f3f4f6", overflowY: "auto" },

  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  title:  { margin: "0 0 6px", fontSize: "22px", fontWeight: "bold" },
  subtitle: { margin: 0, fontSize: "14px", color: "#6b7280" },

  bookmarkFilter: {
    padding: "9px 16px", borderRadius: "8px",
    border: "1px solid #e5e7eb", backgroundColor: "white",
    color: "#6b7280", cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap",
  },
  bookmarkFilterActive: {
    padding: "9px 16px", borderRadius: "8px",
    border: "1px solid #818cf8", backgroundColor: "#ede9fe",
    color: "#818cf8", cursor: "pointer", fontSize: "13px",
    fontWeight: "600", whiteSpace: "nowrap",
  },

  // Tabs
  tabRow: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" },
  tab: {
    padding: "7px 16px", borderRadius: "20px",
    border: "1px solid #e5e7eb", backgroundColor: "white",
    color: "#6b7280", cursor: "pointer", fontSize: "13px",
  },
  tabActive: {
    padding: "7px 16px", borderRadius: "20px",
    border: "1px solid #818cf8", backgroundColor: "#818cf8",
    color: "white", cursor: "pointer", fontSize: "13px", fontWeight: "500",
  },

  resultCount: { fontSize: "12px", color: "#9ca3af", margin: "0 0 16px" },

  // Empty state
  emptyState: {
    textAlign: "center", padding: "60px 20px",
    backgroundColor: "white", borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  emptyIcon:  { fontSize: "36px", margin: "0 0 12px", color: "#d1d5db" },
  emptyTitle: { fontSize: "16px", fontWeight: "600", color: "#374151", margin: "0 0 8px" },
  emptyText:  { fontSize: "13px", color: "#6b7280", margin: "0 0 20px" },
  primaryButton: {
    padding: "9px 18px", borderRadius: "8px", border: "none",
    backgroundColor: "#818cf8", color: "white", cursor: "pointer", fontSize: "13px",
  },

  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },

  // Card
  card: {
    backgroundColor: "white", borderRadius: "12px",
    padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    display: "flex", flexDirection: "column", gap: "10px",
    border: "1px solid #f3f4f6",
  },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  typeBadge: {
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "11px", fontWeight: "500",
  },
  bookmarkBtn: {
    background: "none", border: "none", cursor: "pointer",
    padding: "2px", lineHeight: 1,
  },
  cardTitle: { margin: 0, fontSize: "14px", fontWeight: "600", color: "#111827", lineHeight: 1.4 },
  cardDesc:  { margin: 0, fontSize: "13px", color: "#6b7280", lineHeight: 1.6, flex: 1 },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" },
  readTime:  { fontSize: "11px", color: "#9ca3af" },
  readLink:  {
    fontSize: "13px", fontWeight: "500", color: "#818cf8",
    textDecoration: "none",
  },
};

export default Resources;
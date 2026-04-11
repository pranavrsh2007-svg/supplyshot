import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/AppContext";
import { useNotifications } from "../context/AppContext";
import { markAllRead, deleteNotification } from "../api/notifications";
import { Bell, X, CheckCheck, Trash2, AlertTriangle, FileUp, Info, Wrench } from "lucide-react";

const TYPE_CONFIG = {
  service_due:       { icon: Wrench,        color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  document_uploaded: { icon: FileUp,        color: "#0B5ED7", bg: "rgba(11,94,215,0.1)"  },
  document_deleted:  { icon: Trash2,        color: "#DC3545", bg: "rgba(220,53,69,0.1)"  },
  warning:           { icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  info:              { icon: Info,          color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)   return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function NotificationDropdown() {
  const { darkMode } = useTheme();
  const { notifications, unreadCount, refreshNotifications } = useNotifications();
  const [open, setOpen] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAllRead = async () => {
    setMarkingRead(true);
    try {
      await markAllRead();
      await refreshNotifications();
    } catch { /* silently ignore */ }
    setMarkingRead(false);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      await refreshNotifications();
    } catch { /* silently ignore */ }
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* ── Bell button ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(!open)}
        title="Notifications"
        style={{
          position: "relative",
          background: open
            ? "linear-gradient(135deg,#0B5ED7,#0847b0)"
            : darkMode ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.75)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: `1.5px solid ${open ? "#0B5ED7" : darkMode ? "rgba(255,255,255,0.15)" : "#d1e0f0"}`,
          borderRadius: 12, padding: "8px 10px",
          cursor: "pointer",
          color: open ? "white" : "inherit",
          display: "flex", alignItems: "center", gap: 6,
          transition: "all 0.25s",
          boxShadow: open ? "0 0 18px rgba(11,94,215,0.45)" : "none",
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = "#0B5ED7";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(11,94,215,0.3)";
            e.currentTarget.style.transform = "scale(1.06)";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = darkMode ? "rgba(255,255,255,0.15)" : "#d1e0f0";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "scale(1)";
          }
        }}
      >
        <Bell size={18} color={open ? "white" : "#0B5ED7"} />
        {!open && unreadCount > 0 && (
          <span style={{ fontSize: 12, fontWeight: 700, color: "#0B5ED7" }}>
            {unreadCount}
          </span>
        )}

        {/* Animated badge dot */}
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: "#DC3545", color: "white",
            borderRadius: "50%", minWidth: 18, height: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 800,
            border: `2px solid ${darkMode ? "#0d1117" : "#f8faff"}`,
            boxShadow: "0 0 8px rgba(220,53,69,0.7)",
            animation: "pulse-ring 1.5s ease-out infinite",
            lineHeight: 1, padding: "0 3px",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          width: 360, maxHeight: 460,
          borderRadius: 14, border: `1px solid ${darkMode ? "#30363d" : "#e1e8f0"}`,
          background: darkMode ? "#161b22" : "#ffffff",
          boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
          zIndex: 9999, overflow: "hidden",
          animation: "fadeInDown 0.15s ease",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px", borderBottom: `1px solid ${darkMode ? "#30363d" : "#f1f5f9"}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 7 }}>
              <Bell size={15} color="#0B5ED7" /> Notifications
              {unreadCount > 0 && (
                <span style={{
                  background: "#DC3545", color: "white",
                  borderRadius: 20, padding: "1px 7px", fontSize: 11, fontWeight: 700,
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={markingRead}
                  title="Mark all as read"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#0B5ED7", display: "flex", alignItems: "center", gap: 4,
                    fontSize: 12, fontWeight: 600, padding: "4px 6px", borderRadius: 6,
                  }}
                >
                  <CheckCheck size={13} /> Read all
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "inherit", display: "flex", opacity: 0.5, padding: 4,
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center", opacity: 0.45 }}>
                <Bell size={28} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
                <p style={{ fontSize: 13 }}>No notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                const Icon = cfg.icon;
                return (
                  <div
                    key={n._id}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "12px 16px",
                      background: !n.read
                        ? darkMode ? "rgba(11,94,215,0.06)" : "#f0f7ff"
                        : "transparent",
                      borderBottom: `1px solid ${darkMode ? "#1e262f" : "#f8faff"}`,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.03)" : "#fafbff"; }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = !n.read
                        ? darkMode ? "rgba(11,94,215,0.06)" : "#f0f7ff"
                        : "transparent";
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                      background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon size={16} color={cfg.color} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, marginRight: 6 }}>
                          {n.title}
                        </div>
                        {!n.read && (
                          <div style={{
                            width: 7, height: 7, borderRadius: "50%",
                            background: "#0B5ED7", flexShrink: 0, marginTop: 3,
                          }} />
                        )}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.65, lineHeight: 1.4, marginTop: 2 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.45, marginTop: 4 }}>
                        {timeAgo(n.createdAt)}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={(e) => handleDelete(n._id, e)}
                      title="Dismiss"
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "inherit", opacity: 0.3, padding: 4, flexShrink: 0,
                        transition: "opacity 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; e.currentTarget.style.color = "#DC3545"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.3"; e.currentTarget.style.color = "inherit"; }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

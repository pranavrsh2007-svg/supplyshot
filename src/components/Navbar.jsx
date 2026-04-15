import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme, useAuth } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import NotificationDropdown from "./NotificationDropdown";
import teamLogo from "../assets/team-logo.jpeg";
import {
  Truck, Sun, Moon, Menu, X, LayoutDashboard, Navigation,
  MapPin, AlertTriangle, LogOut, LogIn, User, ChevronDown, Globe,
} from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "EN", nativeLabel: "English" },
  { code: "hi", label: "हि", nativeLabel: "हिंदी" },
  { code: "mr", label: "म", nativeLabel: "मराठी" },
];

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { darkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(
    localStorage.getItem("truckLang") || "en"
  );
  const menuRef = useRef(null);
  const langRef = useRef(null);

  const navLinks = [
    { path: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { path: "/planner", label: t("nav.routePlanner"), icon: Navigation },
    { path: "/stops", label: t("nav.smartStops"), icon: MapPin },
    { path: "/emergency", label: t("nav.emergency"), icon: AlertTriangle },
  ];

  const userMenuLinks = [
    { path: "/profile", label: t("nav.driverProfile"), icon: User },
    { path: "/truck", label: t("nav.truckInfo"), icon: Truck },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("truckLang", code);
    setCurrentLang(code);
    setLangOpen(false);
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <nav className="navbar">
      {/* Hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          padding: "6px",
          display: "flex",
        }}
      >
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Logo */}
      <Link
        to="/"
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <img
          src={teamLogo}
          alt="Team Logo"
          style={{ width: "32px", height: "32px", borderRadius: "8px", objectFit: "cover" }}
        />
        <span
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 800,
            fontSize: "18px",
            background: "linear-gradient(135deg, #0B5ED7, #60a5fa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          TruckAI
        </span>
      </Link>

      <div style={{ flex: 1 }} />

      {/* Desktop nav links */}
      <div className="top-nav-links" style={{ display: "flex", gap: 2, alignItems: "center" }}>
        {navLinks.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              textDecoration: "none",
              color:
                location.pathname === path ? "#0B5ED7" : "inherit",
              background:
                location.pathname === path
                  ? darkMode
                    ? "rgba(11,94,215,0.15)"
                    : "#eff6ff"
                  : "transparent",
              transition: "all 0.2s",
            }}
          >
            {label}
          </Link>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Language Switcher */}
      <div ref={langRef} style={{ position: "relative" }}>
        <button
          onClick={() => setLangOpen(!langOpen)}
          aria-label="Change language"
          title={t("language.select")}
          className="glass-subtle"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            border: `1.5px solid ${langOpen ? "#0B5ED7" : darkMode ? "rgba(255,255,255,0.12)" : "#d1e0f0"}`,
            padding: "6px 10px",
            cursor: "pointer",
            color: "inherit",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <Globe size={14} color="#0B5ED7" />
          <span style={{ color: "#0B5ED7" }}>{currentLangObj.label}</span>
          <ChevronDown
            size={12}
            style={{
              transition: "transform 0.2s",
              transform: langOpen ? "rotate(180deg)" : "none",
              color: "#0B5ED7",
            }}
          />
        </button>

        {langOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              minWidth: 150,
              borderRadius: 12,
              border: "1px solid",
              borderColor: darkMode ? "#30363d" : "#e1e8f0",
              background: darkMode ? "#161b22" : "#ffffff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              zIndex: 9999,
              overflow: "hidden",
              animation: "fadeInDown 0.15s ease",
            }}
          >
            <div style={{
              padding: "8px 12px 4px",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              opacity: 0.5,
            }}>
              {t("language.select")}
            </div>
            {LANGUAGES.map(({ code, label, nativeLabel }) => (
              <button
                key={code}
                onClick={() => changeLanguage(code)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "10px 14px",
                  background: currentLang === code
                    ? darkMode ? "rgba(11,94,215,0.2)" : "#eff6ff"
                    : "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: currentLang === code ? "#0B5ED7" : "inherit",
                  fontSize: 14,
                  fontWeight: currentLang === code ? 700 : 500,
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (currentLang !== code)
                    e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.05)" : "#f8faff";
                }}
                onMouseLeave={(e) => {
                  if (currentLang !== code)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <span>{nativeLabel}</span>
                {currentLang === code && (
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#0B5ED7", flexShrink: 0,
                  }} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notification Bell */}
      <NotificationDropdown />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="glass-subtle"
        style={{
          border: "none",
          padding: "8px",
          cursor: "pointer",
          color: "inherit",
          display: "flex",
        }}
      >
        {darkMode ? (
          <Sun size={18} color="#fbbf24" />
        ) : (
          <Moon size={18} />
        )}
      </button>

      {/* User menu */}
      {user ? (
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="glass-subtle"
            style={{
              border: `1.5px solid ${menuOpen ? "#0B5ED7" : darkMode ? "rgba(255,255,255,0.15)" : "#e1e8f0"}`,
              borderRadius: 10,
              padding: "5px 10px 5px 5px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "inherit",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #0B5ED7, #198754)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {initials}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {user.name?.split(" ")[0]}
            </span>
            <ChevronDown
              size={14}
              style={{
                transition: "transform 0.2s",
                transform: menuOpen ? "rotate(180deg)" : "none",
              }}
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: 200,
                borderRadius: 12,
                border: "1px solid",
                borderColor: darkMode ? "#30363d" : "#e1e8f0",
                background: darkMode ? "#161b22" : "#ffffff",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                zIndex: 9999,
                overflow: "hidden",
              }}
            >
              {/* User info row */}
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: `1px solid ${darkMode ? "#30363d" : "#f1f5f9"}`,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 12, opacity: 0.55 }}>
                  {user.email}
                </div>
              </div>

              {/* Links */}
              {userMenuLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 16px",
                    textDecoration: "none",
                    color: "inherit",
                    fontSize: 14,
                    fontWeight: 500,
                    transition: "background 0.15s",
                    background:
                      location.pathname === path
                        ? darkMode
                          ? "rgba(11,94,215,0.15)"
                          : "#eff6ff"
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = darkMode
                      ? "rgba(255,255,255,0.05)"
                      : "#f8faff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      location.pathname === path
                        ? darkMode
                          ? "rgba(11,94,215,0.15)"
                          : "#eff6ff"
                        : "transparent";
                  }}
                >
                  <Icon size={16} color="#0B5ED7" />
                  {label}
                </Link>
              ))}

              {/* Divider + logout */}
              <div
                style={{
                  borderTop: `1px solid ${darkMode ? "#30363d" : "#f1f5f9"}`,
                }}
              >
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 16px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#DC3545",
                    fontSize: 14,
                    fontWeight: 600,
                    transition: "background 0.15s",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fee2e2";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                  }}
                >
                  <LogOut size={16} /> {t("nav.logout")}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link
          to="/auth"
          className="btn-primary"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
          }}
        >
          <LogIn size={16} /> {t("nav.login")}
        </Link>
      )}
    </nav>
  );
}

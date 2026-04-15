import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, Navigation, MapPin, AlertTriangle, Users,
  Shield, Info, Phone, HelpCircle, User, Truck, BarChart2
} from "lucide-react";

export default function Sidebar({ open }) {
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();

  const links = [
    { path: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
    { path: "/planner", labelKey: "nav.routePlanner", icon: Navigation },
    { path: "/stops", labelKey: "nav.smartStops", icon: MapPin },
    { path: "/emergency", labelKey: "nav.emergency", icon: AlertTriangle },
    { path: "/community", labelKey: "nav.community", icon: Users },
    { path: "/risk-map", labelKey: "nav.riskMap", icon: Shield },
    { path: "/profile", labelKey: "nav.driverProfile", icon: User },
    { path: "/truck", labelKey: "nav.truckInfo", icon: Truck },
    { path: "/trip-insights", labelKey: "nav.tripInsights", icon: BarChart2 },
    { path: "/about", labelKey: "nav.about", icon: Info },
    { path: "/contact", labelKey: "nav.contact", icon: Phone },
    { path: "/faq", labelKey: "nav.faq", icon: HelpCircle },
  ];

  const sections = [
    { headingKey: "sidebar.main", items: links.slice(0, 6) },
    { headingKey: "sidebar.myVehicle", items: links.slice(6, 9) },
    { headingKey: "sidebar.more", items: links.slice(9) },
  ];

  return (
    <aside
      className={`sidebar fixed top-0 left-0 h-full w-[85%] max-w-[320px] shadow-xl md:w-[260px] md:top-[64px] md:h-[calc(100vh-64px)] ${open ? "open" : ""}`}
      style={{ 
        display: open ? "block" : "none"
      }}
    >
      {sections.map(({ headingKey, items }) => (
        <div key={headingKey} style={{ marginBottom: 8 }}>
          <p
            className="sidebar-section-title"
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              padding: "8px 12px 4px",
            }}
          >
            {t(headingKey)}
          </p>

          {items.map(({ path, labelKey, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`sidebar-link ${active ? "active" : ""}`}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                <span>{t(labelKey)}</span>
                {path === "/emergency" && (
                  <span
                    style={{
                      marginLeft: "auto",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#DC3545",
                      animation: "blink 1.5s ease-in-out infinite",
                    }}
                  />
                )}
                {path === "/truck" && (
                  <span
                    className="badge badge-yellow"
                    style={{
                      marginLeft: "auto",
                      fontSize: 9,
                      padding: "2px 6px",
                    }}
                  >
                    Check
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}

      {/* Status indicator */}
      <div
        className="system-status-card"
        style={{
          marginTop: 16,
          padding: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#198754",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: darkMode ? "#34d399" : "#065f46",
            }}
          >
            {t("sidebar.systemOnline")}
          </span>
        </div>
        <p style={{ fontSize: 11, opacity: 0.7, marginLeft: 16 }}>
          {t("sidebar.allServicesActive")}
        </p>
      </div>
    </aside>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth, useTheme } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import ChartsPanel from "../components/ChartsPanel";
import TruckSVG from "../components/TruckSVG";
import { getTruck } from "../api/trucks";
import {
  Navigation, MapPin, AlertTriangle, Shield, TrendingUp,
  Clock, Fuel, Truck, Activity, User, Settings,
} from "lucide-react";

const recentRoutesData = [
  { from: "Mumbai",    to: "Delhi",   dist: "1415 km", statusKey: "dashboard.completed", date: "Apr 01", safe: true },
  { from: "Jaipur",   to: "Agra",    dist: "233 km",  statusKey: "dashboard.completed", date: "Mar 30", safe: true },
  { from: "Bengaluru",to: "Chennai", dist: "346 km",  statusKey: "dashboard.planned",   date: "Apr 02", safe: true },
];

const alerts = [
  { type: "warning", msg: "Heavy traffic on NH48 near Vadodara - delay expected 45 mins" },
  { type: "info",    msg: "Rain expected on Pune-Mumbai Expressway today evening" },
  { type: "success", msg: "Your vehicle inspection is up to date ✅" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const [truckData, setTruckData] = useState(null);

  useEffect(() => {
    getTruck().then(({ data }) => setTruckData(data)).catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12 ? "dashboard.goodMorning"
    : hour < 17 ? "dashboard.goodAfternoon"
    : "dashboard.goodEvening";

  const quickActions = [
    { icon: Navigation,    labelKey: "dashboard.planRoute", to: "/planner",   color: "#0B5ED7" },
    { icon: MapPin,        labelKey: "nav.smartStops",      to: "/stops",     color: "#198754" },
    { icon: AlertTriangle, labelKey: "nav.emergency",       to: "/emergency", color: "#DC3545" },
    { icon: Shield,        labelKey: "nav.riskMap",         to: "/risk-map",  color: "#6366f1" },
  ];

  const stats = [
    { labelKey: "dashboard.routesToday",    value: "3",       delta: "+2",       icon: Navigation, color: "#0B5ED7" },
    { labelKey: "dashboard.distanceCovered",value: "842 km",  delta: "+156 km",  icon: TrendingUp, color: "#198754" },
    { labelKey: "dashboard.driveTime",      value: "11h 30m", delta: "Today",    icon: Clock,      color: "#f59e0b" },
    { labelKey: "dashboard.fuelSaved",      value: "12.4 L",  delta: "This week",icon: Fuel,       color: "#8b5cf6" },
  ];

  const vehicleStatus = [
    { labelKey: "dashboard.engine",   value: 95, color: "#198754" },
    { labelKey: "dashboard.fuelTank", value: 67, color: "#0B5ED7" },
    { labelKey: "dashboard.tyres",    value: 82, color: "#f59e0b" },
    { labelKey: "dashboard.brakes",   value: 78, color: "#8b5cf6" },
  ];

  const truckStatus = truckData?.status || "operational";
  const truckNumber = truckData?.number || user?.truckNumber || "MH12AB1234";
  const nextService = truckData?.nextService ? new Date(truckData.nextService) : new Date("2026-06-01");
  const diffDays    = Math.ceil((nextService - new Date()) / (1000 * 60 * 60 * 24));
  const serviceDue  = diffDays <= 60;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="section-heading" style={{ fontSize: 26, marginBottom: 4 }}>
            {t(greetingKey)}, {user?.name || t("dashboard.driver")} 👋
          </h1>
          <p style={{ opacity: 0.6, fontSize: 14 }}>
            {t("dashboard.drivingOverview")} — {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/planner" className="btn-primary" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <Navigation size={15} /> {t("dashboard.newRoute")}
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {stats.map(({ labelKey, value, delta, icon: Icon, color }, i) => (
          <div key={i} className="card stat-card glass">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 12, opacity: 0.6, fontWeight: 500, marginBottom: 8 }}>{t(labelKey)}</p>
                <p style={{ fontSize: 26, fontWeight: 800, fontFamily: "Outfit, sans-serif" }}>{value}</p>
                <p style={{ fontSize: 12, color: "#198754", marginTop: 4 }}>↑ {delta}</p>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${color}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={22} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Truck hero card with SVG illustration */}
      <div className="card" style={{
        padding: "24px 28px", marginBottom: 24,
        background: darkMode
          ? "linear-gradient(135deg, #0d1117 0%, #1a2130 100%)"
          : "linear-gradient(135deg, #f0f6ff 0%, #e8f0ff 100%)",
        overflow: "hidden", position: "relative",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          {/* Left: truck info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.55, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
              Your Vehicle
            </div>
            <div style={{
              display: "inline-block",
              background: darkMode ? "#1e262f" : "white",
              border: "2px solid #0B5ED7",
              borderRadius: 8, padding: "4px 18px", marginBottom: 10,
              fontFamily: "Outfit, sans-serif", letterSpacing: 3,
              fontWeight: 900, fontSize: 22, color: "#0B5ED7",
            }}>
              {truckNumber}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              <span className={`badge ${serviceDue ? "badge-yellow" : "badge-green"}`} style={{ fontSize: 12 }}>
                {serviceDue ? "⚠️ Service Due" : "✅ Operational"}
              </span>
              {truckData && (
                <>
                  <span className="badge badge-blue" style={{ fontSize: 12 }}>{truckData.type}</span>
                  <span className="badge badge-blue" style={{ fontSize: 12 }}>{truckData.fuelType}</span>
                </>
              )}
            </div>
            {serviceDue && (
              <div style={{
                padding: "8px 14px", borderRadius: 8,
                background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
                fontSize: 12, color: "#92400e", marginBottom: 12,
              }}>
                ⏱ Service due in {diffDays} days — schedule now
              </div>
            )}
            <Link to="/truck" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 9,
              background: "linear-gradient(135deg, #0B5ED7, #0847b0)",
              color: "white", textDecoration: "none", fontSize: 13, fontWeight: 600,
            }}>
              <Settings size={14} /> Manage Truck
            </Link>
          </div>

          {/* Right: SVG illustration */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TruckSVG size={280} status={truckStatus} />
          </div>
        </div>
      </div>

      {/* Driver + Truck summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Driver card */}
        <div className="card glass" style={{ padding: 20, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{
            width: 54, height: 54, borderRadius: "50%",
            background: "linear-gradient(135deg, #0B5ED7, #198754)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 800, color: "white", flexShrink: 0,
          }}>
            {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "PS"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.55, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 3 }}>
              {t("dashboard.driver_label")}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "Outfit, sans-serif", marginBottom: 4 }}>
              {user?.name || "Driver"}
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 12, opacity: 0.7 }}>
              <span>🚗 Heavy Truck</span>
              <span>⏱ 3 years</span>
              <span>🗺️ 120 trips</span>
            </div>
          </div>
          <Link to="/profile" style={{
            padding: "8px 14px", borderRadius: 9,
            background: "linear-gradient(135deg, #0B5ED7, #0847b0)",
            color: "white", textDecoration: "none",
            fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
          }}>
            <User size={14} /> {t("dashboard.viewProfile")}
          </Link>
        </div>

        {/* Truck quick card */}
        <div className="card glass" style={{ padding: 20, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 14,
            background: "linear-gradient(135deg, #0B5ED7, #0847b0)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Truck size={26} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.55, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 3 }}>
              {t("dashboard.myTruck")}
            </div>
            <div style={{
              fontSize: 18, fontWeight: 800, fontFamily: "Outfit, sans-serif",
              letterSpacing: 1, color: "#0B5ED7", marginBottom: 4,
            }}>
              {truckNumber}
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 12, opacity: 0.7 }}>
              <span>📅 Next: {nextService.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              <span>🛡 Insured</span>
            </div>
          </div>
          <Link to="/truck" style={{
            padding: "8px 14px", borderRadius: 9,
            background: "linear-gradient(135deg, #0B5ED7, #0847b0)",
            color: "white", textDecoration: "none",
            fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
          }}>
            <Settings size={14} /> {t("dashboard.viewTruck")}
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, flexWrap: "wrap" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Quick Actions */}
          <div className="card glass" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{t("dashboard.quickActions")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {quickActions.map(({ icon: Icon, labelKey, to, color }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    textDecoration: "none", color: "inherit",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 10, padding: "16px 8px", borderRadius: 12,
                    border: "1px solid", borderColor: darkMode ? "#30363d" : "#e1e8f0",
                    cursor: "pointer", transition: "all 0.2s",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}12`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = darkMode ? "#30363d" : "#e1e8f0"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${color}20`, display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={20} color={color} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{t(labelKey)}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Routes */}
          <div className="card glass" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{t("dashboard.recentRoutes")}</h3>
              <Link to="/planner" style={{ fontSize: 13, color: "#0B5ED7", textDecoration: "none" }}>{t("dashboard.viewAll")}</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentRoutesData.map((r, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 14px", borderRadius: 10,
                  background: darkMode ? "rgba(255,255,255,0.03)" : "#f8faff",
                  border: "1px solid", borderColor: darkMode ? "#30363d" : "#e1e8f0",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "linear-gradient(135deg, #0B5ED7, #198754)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Truck size={16} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{r.from} → {r.to}</div>
                    <div style={{ fontSize: 12, opacity: 0.6 }}>{r.dist} · {r.date}</div>
                  </div>
                  <span className={`badge ${r.statusKey === "dashboard.completed" ? "badge-green" : "badge-blue"}`}>
                    {t(r.statusKey)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Alerts */}
          <div className="card glass" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Activity size={16} color="#DC3545" />
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{t("dashboard.liveAlerts")}</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {alerts.map((a, i) => (
                <div key={i} style={{
                  padding: "10px 12px", borderRadius: 10,
                  background: a.type === "warning" ? (darkMode ? "rgba(234,179,8,0.1)" : "#fef9c3")
                    : a.type === "info" ? (darkMode ? "rgba(11,94,215,0.1)" : "#eff6ff")
                    : (darkMode ? "rgba(25,135,84,0.1)" : "#f0fdf4"),
                  border: "1px solid",
                  borderColor: a.type === "warning" ? "#fde047"
                    : a.type === "info" ? "#bfdbfe"
                    : "#bbf7d0",
                  fontSize: 12, lineHeight: 1.5,
                }}>
                  {a.msg}
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Status */}
          <div className="card glass" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{t("dashboard.vehicleStatus")}</h3>
            {vehicleStatus.map(({ labelKey, value, color }) => (
              <div key={labelKey} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                  <span style={{ fontWeight: 500 }}>{t(labelKey)}</span>
                  <span style={{ fontWeight: 700, color }}>{value}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: darkMode ? "#30363d" : "#e2e8f0" }}>
                  <div style={{
                    height: "100%", borderRadius: 3,
                    width: `${value}%`, background: color,
                    transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="card" style={{ padding: 24, marginTop: 24 }}>
        <ChartsPanel />
      </div>

      {/* 🧠 Driver Insights */}
      <div className="card" style={{ padding: 24, marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            🧠 Driver Insights
          </h3>
          <span style={{ fontSize: 12, opacity: 0.6, fontWeight: 500 }}>AI-powered, updated daily</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {[
            { emoji: "🌙", title: "You drive safer at night", body: "Your average safety score after 10 PM is 97 — 8 points higher than daytime.", tag: "Positive", tagColor: "#198754" },
            { emoji: "⚠️", title: "High risk near city zones", body: "3 of your last 5 harsh-braking events occurred within 10 km of city centres.", tag: "Alert",    tagColor: "#DC3545" },
            { emoji: "⛽", title: "Fuel efficiency decreasing", body: "Your km/L ratio dropped by 6% this week. Check tyre pressure and load balance.", tag: "Warning",  tagColor: "#f59e0b" },
            { emoji: "🚗", title: "Morning rush hours slow you down", body: "Trips between 8–10 AM average 18% longer. Consider departing earlier.", tag: "Tip",      tagColor: "#0B5ED7" },
            { emoji: "🏆", title: "Top 10% driver this month", body: "Your safety rank improved from 18th to 9th. Keep up the smooth driving!", tag: "Positive", tagColor: "#198754" },
            { emoji: "🛑", title: "NH48 near Vadodara — avoid today", body: "Heavy congestion reported. 3 drivers on your route report 40+ min delays.", tag: "Live",     tagColor: "#8b5cf6" },
          ].map(({ emoji, title, body, tag, tagColor }) => (
            <div key={title} style={{
              padding: "16px 18px", borderRadius: 14,
              border: `1.5px solid ${darkMode ? "#30363d" : "#e1e8f0"}`,
              background: darkMode ? "rgba(255,255,255,0.02)" : "#fafbff",
              display: "flex", flexDirection: "column", gap: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = tagColor; e.currentTarget.style.boxShadow = `0 4px 16px ${tagColor}22`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = darkMode ? "#30363d" : "#e1e8f0"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: 22 }}>{emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: `${tagColor}18`, color: tagColor }}>{tag}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
              <div style={{ fontSize: 12, opacity: 0.65, lineHeight: 1.6 }}>{body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

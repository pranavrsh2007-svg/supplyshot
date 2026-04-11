import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useTheme } from "../context/AppContext";
import { Link } from "react-router-dom";
import {
  TrendingUp, Navigation, Fuel, Clock, Shield, ChevronRight, Calendar,
} from "lucide-react";

// ── Static demo data ─────────────────────────────────────────────────────────
const weeklyTrips = [
  { label: "Mon", trips: 2, distance: 340, fuel: 80 },
  { label: "Tue", trips: 3, distance: 520, fuel: 122 },
  { label: "Wed", trips: 1, distance: 180, fuel: 45 },
  { label: "Thu", trips: 4, distance: 710, fuel: 168 },
  { label: "Fri", trips: 2, distance: 420, fuel: 98 },
  { label: "Sat", trips: 3, distance: 580, fuel: 135 },
  { label: "Sun", trips: 1, distance: 145, fuel: 34 },
];

const monthlyTrips = [
  { label: "Jan", trips: 38, distance: 6200, fuel: 1420 },
  { label: "Feb", trips: 34, distance: 5700, fuel: 1310 },
  { label: "Mar", trips: 42, distance: 7100, fuel: 1640 },
  { label: "Apr", trips: 45, distance: 7600, fuel: 1750 },
  { label: "May", trips: 39, distance: 6500, fuel: 1500 },
  { label: "Jun", trips: 47, distance: 8000, fuel: 1840 },
];

const safetyTrend = [
  { label: "W1", score: 82 },
  { label: "W2", score: 78 },
  { label: "W3", score: 85 },
  { label: "W4", score: 91 },
  { label: "W5", score: 88 },
  { label: "W6", score: 94 },
  { label: "W7", score: 92 },
  { label: "W8", score: 96 },
];

const recentTrips = [
  { from: "Mumbai",    to: "Pune",       dist: "148 km", time: "2h 30m", date: "Apr 11", status: "completed", safetyScore: 94 },
  { from: "Pune",      to: "Nashik",     dist: "211 km", time: "3h 45m", date: "Apr 10", status: "completed", safetyScore: 88 },
  { from: "Nashik",    to: "Surat",      dist: "275 km", time: "4h 10m", date: "Apr 09", status: "completed", safetyScore: 91 },
  { from: "Mumbai",    to: "Vadodara",   dist: "412 km", time: "6h 20m", date: "Apr 08", status: "completed", safetyScore: 79 },
  { from: "Vadodara",  to: "Ahmedabad",  dist: "113 km", time: "1h 50m", date: "Apr 07", status: "completed", safetyScore: 95 },
];

const RANGES = ["Weekly", "Monthly"];

function tooltipStyle(darkMode) {
  return {
    contentStyle: {
      background: darkMode ? "#1e2a3a" : "#fff",
      border: `1px solid ${darkMode ? "#30363d" : "#e1e8f0"}`,
      borderRadius: 10, fontSize: 12,
      color: darkMode ? "#e6edf3" : "#1a1a2e",
    },
    labelStyle: { fontWeight: 700, marginBottom: 4 },
  };
}

export default function TripInsights() {
  const { darkMode } = useTheme();
  const [range, setRange] = useState("Weekly");
  const data = range === "Weekly" ? weeklyTrips : monthlyTrips;

  const totalDistance = data.reduce((s, d) => s + d.distance, 0);
  const totalTrips    = data.reduce((s, d) => s + d.trips, 0);
  const totalFuel     = data.reduce((s, d) => s + d.fuel, 0);
  const avgSafety     = Math.round(safetyTrend.reduce((s, d) => s + d.score, 0) / safetyTrend.length);

  const axisColor = darkMode ? "#475569" : "#94a3b8";
  const gridColor = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  const cardStyle = {
    borderRadius: 16, padding: 20,
    border: `1px solid ${darkMode ? "#30363d" : "#e1e8f0"}`,
    background: darkMode ? "#161b22" : "#ffffff",
    boxShadow: darkMode ? "0 2px 16px rgba(0,0,0,0.3)" : "0 2px 16px rgba(11,94,215,0.06)",
  };

  const stats = [
    { label: "Total Trips",      value: totalTrips,                   icon: Navigation, color: "#0B5ED7", unit: "trips"  },
    { label: "Distance Covered", value: `${totalDistance.toLocaleString()}`, icon: TrendingUp, color: "#198754", unit: "km" },
    { label: "Fuel Consumed",    value: totalFuel.toLocaleString(),   icon: Fuel,       color: "#f59e0b", unit: "L"    },
    { label: "Avg Safety Score", value: `${avgSafety}`,               icon: Shield,     color: "#8b5cf6", unit: "/100" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="section-heading" style={{ fontSize: 26, marginBottom: 4 }}>
            📈 Trip Insights
          </h1>
          <p style={{ opacity: 0.6, fontSize: 14 }}>
            Your driving analytics, performance, and journey history
          </p>
        </div>
        {/* Range selector */}
        <div style={{ display: "flex", gap: 8 }}>
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600,
                border: "1.5px solid",
                borderColor: range === r ? "#0B5ED7" : darkMode ? "#30363d" : "#e2e8f0",
                background: range === r ? "linear-gradient(135deg,#0B5ED7,#0847b0)" : "transparent",
                color: range === r ? "white" : "inherit", cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 16, marginBottom: 24 }}>
        {stats.map(({ label, value, icon: Icon, color, unit }) => (
          <div key={label} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 12, opacity: 0.6, fontWeight: 500, marginBottom: 8 }}>{label}</p>
                <p style={{ fontSize: 28, fontWeight: 800, fontFamily: "Outfit,sans-serif", lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>{unit} this {range.toLowerCase()}</p>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={22} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>

        {/* Distance chart */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(11,94,215,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={18} color="#0B5ED7" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Distance Traveled</div>
              <div style={{ fontSize: 11, opacity: 0.55 }}>km per period</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="distG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0B5ED7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0B5ED7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} width={40} />
              <Tooltip {...tooltipStyle(darkMode)} formatter={(v) => [`${v} km`, "Distance"]} />
              <Area type="monotone" dataKey="distance" stroke="#0B5ED7" strokeWidth={2} fill="url(#distG)" dot={false} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Safety score trend */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={18} color="#8b5cf6" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Safety Score Trend</div>
              <div style={{ fontSize: 11, opacity: 0.55 }}>higher is safer</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={safetyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} width={30} />
              <Tooltip {...tooltipStyle(darkMode)} formatter={(v) => [`${v}/100`, "Safety"]} />
              <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: "#8b5cf6" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Trips per period */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(25,135,84,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Navigation size={18} color="#198754" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Trips Completed</div>
              <div style={{ fontSize: 11, opacity: 0.55 }}>per day / month</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data}>
              <defs>
                <linearGradient id="tripG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#198754" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} width={24} />
              <Tooltip {...tooltipStyle(darkMode)} formatter={(v) => [`${v}`, "Trips"]} />
              <Bar dataKey="trips" fill="url(#tripG)" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fuel chart */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Fuel size={18} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Fuel Consumption</div>
              <div style={{ fontSize: 11, opacity: 0.55 }}>litres per period</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fuelG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} width={36} />
              <Tooltip {...tooltipStyle(darkMode)} formatter={(v) => [`${v} L`, "Fuel"]} />
              <Area type="monotone" dataKey="fuel" stroke="#f59e0b" strokeWidth={2} fill="url(#fuelG)" dot={false} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent trip history */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={17} color="#0B5ED7" /> Recent Trips
          </h3>
          <Link to="/planner" style={{ fontSize: 13, color: "#0B5ED7", textDecoration: "none", fontWeight: 600 }}>
            + New Trip
          </Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recentTrips.map((trip, i) => {
            const safeColor = trip.safetyScore >= 90 ? "#198754" : trip.safetyScore >= 75 ? "#f59e0b" : "#DC3545";
            const safeLabel = trip.safetyScore >= 90 ? "Safe ✅" : trip.safetyScore >= 75 ? "OK ⚠️" : "Risky 🔴";
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "13px 16px", borderRadius: 12,
                background: darkMode ? "rgba(255,255,255,0.03)" : "#f8faff",
                border: `1px solid ${darkMode ? "#30363d" : "#e1e8f0"}`,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0B5ED7"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = darkMode ? "#30363d" : "#e1e8f0"; }}
              >
                {/* Route icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: "linear-gradient(135deg,#0B5ED7,#0847b0)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Navigation size={18} color="white" />
                </div>

                {/* Route details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
                    {trip.from} → {trip.to}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.6, display: "flex", gap: 12 }}>
                    <span>📏 {trip.dist}</span>
                    <span>⏱ {trip.time}</span>
                    <span>📅 {trip.date}</span>
                  </div>
                </div>

                {/* Safety + status */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: safeColor }}>{trip.safetyScore}</span>
                  <span style={{ fontSize: 11, color: safeColor, fontWeight: 600 }}>{safeLabel}</span>
                </div>
                <ChevronRight size={15} style={{ opacity: 0.3, flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

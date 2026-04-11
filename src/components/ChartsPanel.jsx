import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../context/AppContext";
import { getFuelData, getDistanceData, getMaintenanceData } from "../api/charts";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Fuel, MapPin, Wrench, Loader2 } from "lucide-react";

const RANGES = [
  { label: "Daily",   value: "daily" },
  { label: "Weekly",  value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

function ChartSkeleton() {
  return (
    <div style={{ height: 180, borderRadius: 10, overflow: "hidden", background: "currentColor", opacity: 0.06 }}>
      <div style={{
        height: "100%",
        background: "linear-gradient(90deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.03) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s ease-in-out infinite",
      }} />
    </div>
  );
}

function RangeFilter({ value, onChange }) {
  const { darkMode } = useTheme();
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          style={{
            padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            border: "1.5px solid",
            borderColor: value === r.value ? "#0B5ED7" : darkMode ? "#30363d" : "#e2e8f0",
            background: value === r.value
              ? "linear-gradient(135deg, #0B5ED7, #0847b0)"
              : "transparent",
            color: value === r.value ? "white" : "inherit",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

const tooltipStyle = (darkMode) => ({
  contentStyle: {
    background: darkMode ? "#1e2a3a" : "#fff",
    border: `1px solid ${darkMode ? "#30363d" : "#e1e8f0"}`,
    borderRadius: 10,
    fontSize: 12,
    color: darkMode ? "#e6edf3" : "#1a1a2e",
  },
  itemStyle: { color: darkMode ? "#93c5fd" : "#0B5ED7" },
  labelStyle: { fontWeight: 700, marginBottom: 4 },
});

export default function ChartsPanel() {
  const { darkMode } = useTheme();
  const [range, setRange] = useState("weekly");
  const [fuelData, setFuelData] = useState([]);
  const [distData, setDistData] = useState([]);
  const [maintData, setMaintData] = useState([]);
  const [loading, setLoading] = useState(true);

  const axisColor = darkMode ? "#475569" : "#94a3b8";
  const gridColor = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [f, d, m] = await Promise.all([
        getFuelData(range),
        getDistanceData(range),
        getMaintenanceData(range),
      ]);
      setFuelData(f.data.data);
      setDistData(d.data.data);
      setMaintData(m.data.data);
    } catch {
      // silently handled — mock API doesn't throw
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const card = {
    borderRadius: 16, padding: 20,
    border: `1px solid ${darkMode ? "#30363d" : "#e1e8f0"}`,
    background: darkMode ? "#161b22" : "#ffffff",
    boxShadow: darkMode ? "0 2px 16px rgba(0,0,0,0.3)" : "0 2px 16px rgba(11,94,215,0.06)",
  };

  return (
    <div>
      {/* Panel header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: "Outfit, sans-serif", margin: 0 }}>
          📊 Analytics & Charts
        </h2>
        <RangeFilter value={range} onChange={setRange} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {/* ── Fuel Usage ──────────────────────────────────────────────────── */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Fuel size={18} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Fuel Usage</div>
              <div style={{ fontSize: 11, opacity: 0.55 }}>Litres consumed</div>
            </div>
          </div>
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={fuelData}>
                <defs>
                  <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} width={36} />
                <Tooltip {...tooltipStyle(darkMode)} formatter={(v) => [`${v} L`, "Fuel"]} />
                <Area type="monotone" dataKey="fuel" stroke="#f59e0b" strokeWidth={2} fill="url(#fuelGrad)" dot={false} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Distance Traveled ───────────────────────────────────────────── */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(11,94,215,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MapPin size={18} color="#0B5ED7" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Distance Traveled</div>
              <div style={{ fontSize: 11, opacity: 0.55 }}>Kilometres</div>
            </div>
          </div>
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={distData}>
                <defs>
                  <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0B5ED7" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} width={44} />
                <Tooltip {...tooltipStyle(darkMode)} formatter={(v) => [`${v} km`, "Distance"]} />
                <Bar dataKey="distance" fill="url(#distGrad)" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Maintenance History ─────────────────────────────────────────── */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wrench size={18} color="#8b5cf6" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Maintenance Cost</div>
              <div style={{ fontSize: 11, opacity: 0.55 }}>Rupees spent</div>
            </div>
          </div>
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={maintData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} width={44} />
                <Tooltip {...tooltipStyle(darkMode)} formatter={(v) => [`₹${v.toLocaleString()}`, "Cost"]} />
                <Line type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: "#8b5cf6" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

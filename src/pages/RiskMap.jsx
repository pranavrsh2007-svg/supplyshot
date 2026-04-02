import { useTheme } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import LeafletMap from "../components/LeafletMap";
import { Circle, Popup } from "react-leaflet";
import { Shield, AlertTriangle, Info, TrendingUp } from "lucide-react";

const riskZones = [
  { lat: 28.7041, lon: 77.1025, name: "Delhi NCR", label: "High Accident Zone", color: "#DC3545", radius: 40000, level: "high" },
  { lat: 19.076, lon: 72.8777, name: "Mumbai Expressway", label: "Traffic Congestion", color: "#f59e0b", radius: 30000, level: "medium" },
  { lat: 13.0827, lon: 80.2707, name: "Chennai Bypass", label: "Fog Zone", color: "#f59e0b", radius: 25000, level: "medium" },
  { lat: 12.9716, lon: 77.5946, name: "Bengaluru Outer Ring", label: "Road Construction", color: "#0B5ED7", radius: 20000, level: "low" },
  { lat: 17.385, lon: 78.4867, name: "Hyderabad ORR", label: "High Speed Zone", color: "#DC3545", radius: 35000, level: "high" },
  { lat: 26.9124, lon: 75.7873, name: "Jaipur NH11", label: "Animal Crossing", color: "#f59e0b", radius: 18000, level: "medium" },
  { lat: 23.0225, lon: 72.5714, name: "Ahmedabad-Vadodara", label: "Heavy Traffic", color: "#DC3545", radius: 28000, level: "high" },
  { lat: 22.5726, lon: 88.3639, name: "Kolkata Bypass", label: "Flooded Roads", color: "#0B5ED7", radius: 22000, level: "low" },
];

const RiskCircles = () => (
  <>
    {riskZones.map((zone, i) => (
      <Circle
        key={i}
        center={[zone.lat, zone.lon]}
        radius={zone.radius}
        pathOptions={{
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: 0.2,
          weight: 2,
          dashArray: zone.level === "high" ? "6, 4" : null
        }}
      >
        <Popup>
          <div style={{ minWidth: 180 }}>
            <strong style={{ color: zone.color }}>⚠️ {zone.name}</strong><br />
            <span style={{ fontSize: 13 }}>{zone.label}</span><br />
            <span className={`badge badge-${zone.level === "high" ? "red" : zone.level === "medium" ? "yellow" : "blue"}`} style={{ marginTop: 6, display: "inline-flex" }}>
              {zone.level.toUpperCase()} RISK
            </span>
          </div>
        </Popup>
      </Circle>
    ))}
  </>
);

export default function RiskMap() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();

  const highCount = riskZones.filter(z => z.level === "high").length;
  const medCount = riskZones.filter(z => z.level === "medium").length;
  const lowCount = riskZones.filter(z => z.level === "low").length;

  const legend = [
    { color: "#DC3545", labelKey: "riskMap.highRisk", descKey: "riskMap.highRiskDesc" },
    { color: "#f59e0b", labelKey: "riskMap.mediumRisk", descKey: "riskMap.mediumRiskDesc" },
    { color: "#0B5ED7", labelKey: "riskMap.lowRisk", descKey: "riskMap.lowRiskDesc" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-heading" style={{ fontSize: 26, marginBottom: 4 }}>🔴 {t("riskMap.title")}</h1>
        <p style={{ opacity: 0.6, fontSize: 14 }}>{t("riskMap.subtitle")}</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { labelKey: "riskMap.highRisk", count: highCount, color: "#DC3545", bg: "#fee2e2", icon: AlertTriangle },
          { labelKey: "riskMap.mediumRisk", count: medCount, color: "#f59e0b", bg: "#fef3c7", icon: TrendingUp },
          { labelKey: "riskMap.lowRisk", count: lowCount, color: "#0B5ED7", bg: "#dbeafe", icon: Info },
        ].map(({ labelKey, count, color, bg, icon: Icon }) => (
          <div key={labelKey} className="card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: darkMode ? `${color}20` : bg,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "Outfit, sans-serif", color }}>{count}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{t(labelKey)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Map with risk circles */}
      <LeafletMap center={[22.9734, 78.6569]} zoom={5} height="500px">
        <RiskCircles />
      </LeafletMap>

      {/* Legend */}
      <div className="card" style={{ padding: 20, marginTop: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={16} color="#0B5ED7" /> {t("riskMap.mapLegend")}
        </h3>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {legend.map(({ color, labelKey, descKey }) => (
            <div key={labelKey} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 16, borderRadius: 4,
                background: `${color}40`,
                border: `2px solid ${color}`
              }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color }}>{t(labelKey)}</div>
                <div style={{ fontSize: 11, opacity: 0.65 }}>{t(descKey)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone list */}
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "24px 0 14px" }}>{t("riskMap.allZones")}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
        {riskZones.map((zone, i) => (
          <div key={i} className="card" style={{ padding: 16, borderLeft: `4px solid ${zone.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{zone.name}</div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{zone.label}</div>
              </div>
              <span className={`badge ${zone.level === "high" ? "badge-red" : zone.level === "medium" ? "badge-yellow" : "badge-blue"}`}>
                {zone.level}
              </span>
            </div>
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 8 }}>
              📍 {zone.lat}°N, {zone.lon}°E · Radius: {(zone.radius / 1000).toFixed(0)} km
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

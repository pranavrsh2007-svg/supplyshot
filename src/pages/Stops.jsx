import { useState } from "react";
import { useTheme } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import { Fuel, Utensils, Wrench, Shield, Phone, Star, MapPin, Clock, ChevronDown, ChevronUp, Search } from "lucide-react";

function StopCard({ stop, catColor }) {
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card" style={{ padding: 16, cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: stop.open ? "#198754" : "#DC3545", flexShrink: 0 }} />
            <span style={{ fontSize: 15, fontWeight: 700 }}>{stop.name}</span>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12, opacity: 0.7, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {stop.dist}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {stop.time}</span>
            {stop.rating && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#f59e0b" }}>
                <Star size={12} fill="#f59e0b" /> {stop.rating}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <span className={`badge ${stop.open ? "badge-green" : "badge-red"}`}>
            {stop.open ? t("common.open") : t("common.closed")}
          </span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${darkMode ? "#30363d" : "#e1e8f0"}` }}>
          <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 12 }}>ℹ️ {stop.note}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <a
              href={`tel:${stop.phone}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8,
                background: catColor + "20", color: catColor,
                border: `1px solid ${catColor}40`,
                textDecoration: "none", fontSize: 13, fontWeight: 600
              }}
            >
              <Phone size={14} /> {stop.phone}
            </a>
            <button
              onClick={(e) => { e.stopPropagation(); }}
              style={{
                padding: "7px 14px", borderRadius: 8,
                background: "linear-gradient(135deg, #0B5ED7, #0847b0)",
                color: "white", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6
              }}
            >
              <MapPin size={14} /> {t("common.navigate")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Stops() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("fuel");
  const [search, setSearch] = useState("");

  const categories = [
    { id: "fuel", labelKey: "stops.fuelStation", icon: Fuel, color: "#f59e0b" },
    { id: "food", labelKey: "stops.dhaba", icon: Utensils, color: "#198754" },
    { id: "repair", labelKey: "stops.repair", icon: Wrench, color: "#0B5ED7" },
    { id: "police", labelKey: "stops.police", icon: Shield, color: "#DC3545" },
  ];

  const stopsData = {
    fuel: [
      { name: "Indian Oil Pump – NH48", dist: "12 km", time: "18 min", rating: 4.5, phone: "0124-456789", note: "24/7 · HSD & Petrol available", open: true },
      { name: "HPCL Fuel Station – Sohna Road", dist: "24 km", time: "32 min", rating: 4.2, phone: "0124-789012", note: "Truckers welcome · ATM nearby", open: true },
      { name: "BPCL SuperFuel, Delhi Highway", dist: "38 km", time: "48 min", rating: 4.7, phone: "011-23456789", note: "Discounts for fleet cards", open: false },
    ],
    food: [
      { name: "Shera da Dhaba", dist: "8 km", time: "12 min", rating: 4.8, phone: "9876543210", note: "Best dal makhani · Trucker Special thali ₹80", open: true },
      { name: "Punjab Dhaba – NH8", dist: "15 km", time: "20 min", rating: 4.6, phone: "9812345678", note: "Parking for trucks · AC hall available", open: true },
      { name: "Chabela Dhaba", dist: "28 km", time: "36 min", rating: 4.3, phone: "9823456789", note: "Open 24 hours · Shower facility", open: true },
    ],
    repair: [
      { name: "Balaji Truck Repair", dist: "5 km", time: "8 min", rating: 4.4, phone: "9898765432", note: "Hydraulics · Engine · Tyres", open: true },
      { name: "Jagdamba Motors", dist: "18 km", time: "24 min", rating: 4.1, phone: "9845678901", note: "Wheel alignment · AC repair", open: false },
      { name: "Shiva Truck Works", dist: "31 km", time: "42 min", rating: 4.6, phone: "9834567890", note: "Emergency roadside service", open: true },
    ],
    police: [
      { name: "Highway Patrol Checkpoint – km 48", dist: "14 km", time: "19 min", rating: null, phone: "100", note: "Always active · Document check", open: true },
      { name: "RTO Checkpost – Sohna", dist: "22 km", time: "30 min", rating: null, phone: "7890234567", note: "Weight check · Permit verification", open: true },
      { name: "Police Station – NH58", dist: "35 km", time: "46 min", rating: null, phone: "0120-2456789", note: "Emergency assistance available", open: true },
    ],
  };

  const cat = categories.find((c) => c.id === activeCategory);
  const stops = (stopsData[activeCategory] || []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-heading" style={{ fontSize: 26, marginBottom: 4 }}>📍 {t("stops.title")}</h1>
        <p style={{ opacity: 0.6, fontSize: 14 }}>{t("stops.subtitle")}</p>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {categories.map(({ id, labelKey, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 12,
              border: "1.5px solid",
              borderColor: activeCategory === id ? color : (darkMode ? "#30363d" : "#e1e8f0"),
              background: activeCategory === id ? `${color}15` : "transparent",
              color: activeCategory === id ? color : "inherit",
              cursor: "pointer", fontWeight: 600, fontSize: 14,
              transition: "all 0.2s"
            }}
          >
            <Icon size={17} />
            {t(labelKey)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 360, marginBottom: 20 }}>
        <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#0B5ED7" }} />
        <input
          className="input-field"
          type="text"
          placeholder={`${t("stops.search")} ${cat ? t(cat.labelKey) : ""}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 38 }}
        />
      </div>

      {/* Stops list */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
        {stops.length === 0 ? (
          <div style={{ textAlign: "center", opacity: 0.5, padding: 40, gridColumn: "1/-1" }}>
            {t("stops.noStops")}
          </div>
        ) : (
          stops.map((stop, i) => (
            <StopCard key={i} stop={stop} catColor={cat?.color || "#0B5ED7"} />
          ))
        )}
      </div>

      {/* Info banner */}
      <div style={{
        marginTop: 24, padding: "16px 20px", borderRadius: 12,
        background: darkMode ? "rgba(11,94,215,0.1)" : "#eff6ff",
        border: "1px solid", borderColor: darkMode ? "rgba(11,94,215,0.3)" : "#bfdbfe",
        fontSize: 13, display: "flex", alignItems: "center", gap: 10
      }}>
        <span>💡</span>
        <span>{t("stops.gpsInfo")}</span>
      </div>
    </div>
  );
}

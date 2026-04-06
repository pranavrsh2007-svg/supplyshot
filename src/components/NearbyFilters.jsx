import { POI_CATEGORIES } from "../hooks/useNearbyPlaces";
import { Loader2 } from "lucide-react";

// ─── Nearby Places Filter Toggles ─────────────────────────────────────────────
export default function NearbyFilters({
  filters,        // { fuel: true, food: true, ... }
  setFilters,     // setter
  loading = false,
  error   = "",
  placeCounts = {},  // { fuel: 5, food: 12, ... }
  darkMode = false,
}) {
  const toggle = (key) =>
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  const anyActive = Object.values(filters).some(Boolean);

  return (
    <div className="card glass" style={{ padding: 16 }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>📍</span>
          <span style={{
            fontSize: 12, fontWeight: 700, opacity: 0.6,
            textTransform: "uppercase", letterSpacing: "0.5px",
          }}>
            Nearby Services
          </span>
          {loading && (
            <Loader2
              size={13}
              style={{ animation: "spin 0.8s linear infinite", color: "#0B5ED7" }}
            />
          )}
        </div>

        {/* Toggle all */}
        <button
          onClick={() => {
            const allOn = Object.values(filters).every(Boolean);
            const newState = {};
            POI_CATEGORIES.forEach((c) => { newState[c.key] = !allOn; });
            setFilters(newState);
          }}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 11, fontWeight: 600, color: "#0B5ED7",
            padding: "2px 6px",
          }}
        >
          {Object.values(filters).every(Boolean) ? "Hide All" : "Show All"}
        </button>
      </div>

      {/* Category toggles */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 6,
      }}>
        {POI_CATEGORIES.map((cat) => {
          const active = filters[cat.key];
          const count  = placeCounts[cat.key] || 0;

          return (
            <button
              key={cat.key}
              onClick={() => toggle(cat.key)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 11px", borderRadius: 10,
                border: "1.5px solid",
                borderColor: active ? cat.color : (darkMode ? "#30363d" : "#e1e8f0"),
                background: active
                  ? `${cat.color}14`
                  : (darkMode ? "rgba(255,255,255,0.03)" : "transparent"),
                color: active ? cat.color : "inherit",
                cursor: "pointer",
                fontSize: 12, fontWeight: 600,
                transition: "all 0.2s ease",
                opacity: active ? 1 : 0.65,
              }}
            >
              <span style={{ fontSize: 14 }}>{cat.emoji}</span>
              {cat.label}
              {count > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: active ? cat.color : (darkMode ? "#30363d" : "#d1d5db"),
                  color: active ? "white" : (darkMode ? "#e6edf3" : "#555"),
                  borderRadius: 8, padding: "1px 6px",
                  minWidth: 18, textAlign: "center",
                  transition: "all 0.2s",
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Error message */}
      {error && !loading && (
        <div style={{
          marginTop: 10, padding: "7px 12px", borderRadius: 8,
          background: darkMode ? "rgba(220,53,69,0.1)" : "#fef2f2",
          color: "#DC3545", fontSize: 11, fontWeight: 500,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div style={{
          marginTop: 10, padding: "7px 12px", borderRadius: 8,
          background: darkMode ? "rgba(11,94,215,0.08)" : "#eff6ff",
          color: "#0B5ED7", fontSize: 11, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} />
          Scanning nearby services around halts...
        </div>
      )}
    </div>
  );
}

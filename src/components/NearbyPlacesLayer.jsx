import { Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { POI_CATEGORIES } from "../hooks/useNearbyPlaces";

// ─── Create small emoji-based DivIcon per category ───────────────────────────
const iconCache = {};

function getPOIIcon(category) {
  if (iconCache[category]) return iconCache[category];

  const cat = POI_CATEGORIES.find((c) => c.key === category);
  if (!cat) return null;

  const icon = new L.DivIcon({
    className: "",
    html: `<div style="
      width: 30px; height: 30px; border-radius: 50%;
      background: ${cat.color};
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; line-height: 1;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      border: 2.5px solid white;
      transition: transform 0.2s;
    ">${cat.emoji}</div>`,
    iconSize:    [30, 30],
    iconAnchor:  [15, 15],
    popupAnchor: [0, -18],
  });

  iconCache[category] = icon;
  return icon;
}

// ─── Nearby Places Layer ──────────────────────────────────────────────────────
export default function NearbyPlacesLayer({
  places    = {},     // { haltKey: { fuel: [...], food: [...], ... } }
  filters   = {},     // { fuel: true, food: true, ... }
  haltCoords = [],    // [{ lat, lon }] for radius circles
  darkMode  = false,
}) {
  const allPlaces = [];

  // Flatten places grouped by halt → flat array filtered by active category filters
  Object.entries(places).forEach(([haltKey, categories]) => {
    Object.entries(categories).forEach(([catKey, items]) => {
      if (!filters[catKey]) return;       // skip if filter is off
      items.forEach((place) => {
        allPlaces.push({ ...place, catKey, haltKey });
      });
    });
  });

  return (
    <>
      {/* Radius circles around each halt */}
      {haltCoords.map((halt, i) => {
        const haltKey = `${halt.lat.toFixed(4)}_${halt.lon.toFixed(4)}`;
        const radius = places[haltKey]?.radiusUsed || 3000;
        
        let color = darkMode ? "rgba(96,165,250,0.35)" : "rgba(11,94,215,0.25)";
        let fillColor = darkMode ? "rgba(96,165,250,0.06)" : "rgba(11,94,215,0.04)";

        if (radius === "route") return null;

        if (radius === 3000) {
          color = darkMode ? "rgba(74, 222, 128, 0.5)" : "rgba(22, 163, 74, 0.4)";
          fillColor = darkMode ? "rgba(74, 222, 128, 0.08)" : "rgba(22, 163, 74, 0.06)";
        } else if (radius === 5000) {
          color = darkMode ? "rgba(251, 146, 60, 0.5)" : "rgba(234, 88, 12, 0.4)";
          fillColor = darkMode ? "rgba(251, 146, 60, 0.08)" : "rgba(234, 88, 12, 0.06)";
        } else if (radius === 10000) {
          color = darkMode ? "rgba(248, 113, 113, 0.5)" : "rgba(220, 38, 38, 0.4)";
          fillColor = darkMode ? "rgba(248, 113, 113, 0.08)" : "rgba(220, 38, 38, 0.06)";
        } else if (radius === 20000) {
          color = darkMode ? "rgba(168, 85, 247, 0.5)" : "rgba(147, 51, 234, 0.4)";
          fillColor = darkMode ? "rgba(168, 85, 247, 0.08)" : "rgba(147, 51, 234, 0.06)";
        }

        return (
          <Circle
            key={`radius-${i}`}
            center={[halt.lat, halt.lon]}
            radius={radius}
            pathOptions={{
              color,
              fillColor,
              fillOpacity: 1,
              weight: 1.5,
              dashArray: "6 4",
            }}
          />
        );
      })}

      {/* POI markers */}
      {allPlaces.map((place) => {
        const cat  = POI_CATEGORIES.find((c) => c.key === place.catKey);
        const icon = getPOIIcon(place.catKey);
        if (!icon) return null;

        return (
          <Marker
            key={`poi-${place.id}-${place.catKey}`}
            position={[place.lat, place.lon]}
            icon={icon}
          >
            <Popup>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                lineHeight: 1.6,
                minWidth: 160,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  marginBottom: 4,
                }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: cat?.color || "#666",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13,
                  }}>{cat?.emoji}</span>
                  <strong style={{ fontSize: 13 }}>{place.name}</strong>
                </div>

                <div style={{
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 12, color: "#666", marginTop: 2,
                }}>
                  📍 {place.distance < 1
                    ? `${(place.distance * 1000).toFixed(0)} m`
                    : `${place.distance.toFixed(1)} km`}
                  <span style={{
                    marginLeft: "auto",
                    padding: "1px 7px",
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 600,
                    background: `${cat?.color}18`,
                    color: cat?.color,
                    textTransform: "uppercase",
                  }}>
                    {cat?.label}
                  </span>
                </div>

                {(place.tags?.["opening_hours"] || place.tags?.["phone"]) && (
                  <div style={{ marginTop: 4, fontSize: 11, color: "#888" }}>
                    {place.tags["opening_hours"] && (
                      <div>🕐 {place.tags["opening_hours"]}</div>
                    )}
                    {place.tags["phone"] && (
                      <div>📞 {place.tags["phone"]}</div>
                    )}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

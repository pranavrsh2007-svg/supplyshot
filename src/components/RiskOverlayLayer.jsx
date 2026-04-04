import { Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";

// ─── Warning DivIcon ──────────────────────────────────────────────────────────
const makeWarningIcon = (color = "#DC3545", riskScore = 0) =>
  new L.DivIcon({
    className: "",
    html: `<div style="
      display:flex;flex-direction:column;align-items:center;
      filter:drop-shadow(0 3px 8px rgba(0,0,0,0.35));
    ">
      <div style="
        background:${color};color:white;
        border-radius:50%;width:32px;height:32px;
        display:flex;align-items:center;justify-content:center;
        font-size:16px;border:3px solid white;
        box-shadow:0 0 0 2px ${color}80;
        animation:riskPulse 2s ease-in-out infinite;
      ">⚠️</div>
      <div style="
        background:${color};color:white;font-size:9px;font-weight:800;
        padding:2px 7px;border-radius:10px;margin-top:3px;
        border:1.5px solid white;font-family:'Inter',sans-serif;
        letter-spacing:0.3px;white-space:nowrap;
      ">${riskScore}</div>
    </div>`,
    iconSize:    [40, 52],
    iconAnchor:  [20, 52],
    popupAnchor: [0, -55],
  });

// ─── Route segment colour overlay ────────────────────────────────────────────
// We split the route into N equal-length chunks (one per segment gap between stops).
// Each chunk is coloured by the *worse* of the two adjacent stop risk levels.
function chunkCoords(coords, n) {
  if (!coords || coords.length < 2 || n < 1) return [];
  const size = Math.ceil(coords.length / n);
  return Array.from({ length: n }, (_, i) => ({
    coords: coords.slice(i * size, (i + 1) * size + 1).filter(Boolean),
    index:  i,
  }));
}

// ─── Main Component ───────────────────────────────────────────────────────────
/**
 * A React-Leaflet child component.
 * Props:
 *   segments   – array of SegmentRisk objects from predictRouteRisks()
 *   baseCoords – full route [lat, lon] array
 */
export default function RiskOverlayLayer({ segments = [], baseCoords = [] }) {
  if (!segments.length || !baseCoords.length) return null;

  // Only overlay segments that have notable risk
  const riskySegments = segments.filter(s => s.level !== "safe");

  // Build polyline chunks — one per inter-stop gap
  const chunks = chunkCoords(baseCoords, Math.max(segments.length - 1, 1));

  return (
    <>
      {/* ── Coloured polyline overlays ── */}
      {chunks.map(({ coords, index }) => {
        // Risk level is determined by the stop at the end of this segment chunk
        const seg = segments[Math.min(index + 1, segments.length - 1)];
        if (!seg || seg.level === "safe" || coords.length < 2) return null;

        return (
          <Polyline
            key={`risk-line-${index}`}
            positions={coords}
            color={seg.color}
            weight={8}
            opacity={0.55}
            dashArray={seg.level === "high" ? "10 6" : "14 8"}
          >
            <Popup>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, minWidth: 180 }}>
                <strong style={{ color: seg.color }}>
                  ⚠️ {seg.label} — {seg.stopName}
                </strong>
                <br />
                <span style={{ fontSize: 12, opacity: 0.75 }}>Risk score: {seg.riskScore}/100</span>
                <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
                  {seg.alerts.slice(0, 2).map((a, i) => (
                    <div key={i} style={{ fontSize: 11 }}>{a}</div>
                  ))}
                </div>
              </div>
            </Popup>
          </Polyline>
        );
      })}

      {/* ── Warning markers at risky stops ── */}
      {riskySegments.map((seg) => (
        <Marker
          key={`risk-marker-${seg.stopIndex}`}
          position={[seg.lat, seg.lon]}
          icon={makeWarningIcon(seg.color, seg.riskScore)}
          zIndexOffset={1000}
        >
          <Popup>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, minWidth: 200 }}>
              <div style={{
                marginBottom: 8, paddingBottom: 8,
                borderBottom: "1px solid rgba(0,0,0,0.08)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <strong style={{ color: seg.color }}>⚠️ {seg.stopName}</strong>
              </div>

              {/* Risk score */}
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{
                  flex: 1, textAlign: "center", padding: "6px 0",
                  background: `${seg.color}15`, borderRadius: 8,
                  border: `1px solid ${seg.color}30`,
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: seg.color }}>{seg.riskScore}</div>
                  <div style={{ fontSize: 9, opacity: 0.65 }}>RISK SCORE</div>
                </div>
                <div style={{
                  flex: 1, textAlign: "center", padding: "6px 0",
                  background: "rgba(25,135,84,0.1)", borderRadius: 8,
                  border: "1px solid rgba(25,135,84,0.2)",
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#198754" }}>{100 - seg.riskScore}</div>
                  <div style={{ fontSize: 9, opacity: 0.65 }}>SAFETY</div>
                </div>
              </div>

              <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 6 }}>
                🕐 ETA: {seg.arrivalLabel}
              </div>

              {/* Alerts */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {seg.alerts.slice(0, 3).map((a, i) => (
                  <div key={i} style={{
                    fontSize: 11, padding: "4px 8px", borderRadius: 6,
                    background: "rgba(0,0,0,0.04)", lineHeight: 1.4,
                  }}>
                    {a}
                  </div>
                ))}
                {seg.alerts.length > 3 && (
                  <div style={{ fontSize: 10, opacity: 0.55, textAlign: "right" }}>
                    + {seg.alerts.length - 3} more alerts
                  </div>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

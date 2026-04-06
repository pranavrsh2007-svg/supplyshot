import { useMemo, useState, useEffect, useRef } from "react";
import {
  predictRouteRisks, overallSafetyScore, classifyRisk
} from "../utils/riskEngine";
import {
  Shield, AlertTriangle, ChevronDown, ChevronUp,
  Bell, BellOff, Zap, Clock, CloudRain, Lock, TrendingUp
} from "lucide-react";

// ─── Mini Score Ring (SVG donut) ─────────────────────────────────────────────
function ScoreRing({ score, size = 80, stroke = 7 }) {
  const r      = (size - stroke * 2) / 2;
  const circ   = 2 * Math.PI * r;
  const { color } = classifyRisk(100 - score); // invert: safety score
  const safeColor = score >= 70 ? "#198754" : score >= 50 ? "#f59e0b" : "#DC3545";
  const dash   = (score / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(128,128,128,0.15)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={safeColor} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,2,.6,1)" }}
      />
    </svg>
  );
}

// ─── Risk Bar ─────────────────────────────────────────────────────────────────
function RiskBar({ label, value, color, icon: Icon }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, opacity: 0.7 }}>
          {Icon && <Icon size={10} />} {label}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ height: 4, borderRadius: 4, background: "rgba(128,128,128,0.15)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${value}%`,
          background: color, borderRadius: 4,
          transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

// ─── Per-Stop Alert Card ──────────────────────────────────────────────────────
function SegmentCard({ seg, darkMode, idx }) {
  const [expanded, setExpanded] = useState(seg.level === "high");

  const cardBg = darkMode ? seg.bgDark : seg.bgLight;
  const isFirst = seg.isStart;
  const isLast  = seg.isEnd;
  const label   = isFirst ? "🟢 Start" : isLast ? "🔴 End" : `🟡 Halt ${idx}`;

  return (
    <div
      className="alert-item"
      style={{
        borderRadius: 10,
        border: `1.5px solid ${seg.color}40`,
        background: cardBg,
        borderLeft: `4px solid ${seg.color}`,
        overflow: "hidden",
        transition: "all 0.25s ease",
        animation: "slideInRight 0.4s ease forwards",
        animationDelay: `${idx * 0.07}s`,
        opacity: 0,
      }}
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: "100%", padding: "10px 12px",
          background: "transparent", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, textAlign: "left",
        }}
      >
        {/* Score ring */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <ScoreRing score={100 - seg.riskScore} size={42} stroke={4} />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 800, color: seg.color,
            transform: "none",
          }}>
            {seg.riskScore}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.6 }}>{label}</span>
            <span style={{
              padding: "2px 7px", borderRadius: 20, fontSize: 9, fontWeight: 700,
              background: `${seg.color}25`, color: seg.color, textTransform: "uppercase",
            }}>
              {seg.level}
            </span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {seg.stopName}
          </div>
          <div style={{ fontSize: 10, opacity: 0.55, marginTop: 1, display: "flex", alignItems: "center", gap: 3 }}>
            <Clock size={9} /> ETA {seg.arrivalLabel}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: seg.color, fontWeight: 700 }}>
            {seg.alerts.length} alert{seg.alerts.length !== 1 ? "s" : ""}
          </span>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: "0 12px 12px" }}>
          {/* Risk breakdown bars */}
          <div style={{ marginBottom: 12 }}>
            <RiskBar label="Weather" value={seg.weatherRisk} color="#0B5ED7" icon={CloudRain} />
            <RiskBar label="Crime / Zone" value={seg.crimeRisk} color="#DC3545" icon={Lock} />
            <RiskBar label="Time of Day" value={seg.timeRisk} color="#f59e0b" icon={Clock} />
            <RiskBar label="Traffic" value={seg.trafficRisk} color="#8b5cf6" icon={TrendingUp} />
          </div>

          {/* Alert list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {seg.alerts.map((alert, i) => (
              <div key={i} style={{
                fontSize: 11, lineHeight: 1.5,
                padding: "5px 10px", borderRadius: 6,
                background: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                display: "flex", alignItems: "flex-start", gap: 6,
              }}>
                {alert}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main PredictiveAlerts Component ─────────────────────────────────────────
export default function PredictiveAlerts({
  stops = [],
  durationSecs = 0,
  departureTime = new Date(),
  darkMode,
  voiceEnabled,
  onSpeak,
  onSegmentsReady,   // callback(segments) → parent lifts state for map
}) {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem("truckPredictiveAlerts");
    return stored === null ? true : stored === "true";
  });
  const [showAll, setShowAll] = useState(false);
  const voicedRef = useRef(false); // speak once per route

  // ── Prediction ─────────────────────────────────────────────────────────────
  const segments = useMemo(() => {
    if (!stops || stops.length < 2) return [];
    return predictRouteRisks(stops, durationSecs, departureTime);
  }, [stops, durationSecs, departureTime]);

  const safetyScore = useMemo(() => overallSafetyScore(segments), [segments]);
  const { color: safeColor, label: safeLabel } = classifyRisk(100 - safetyScore);
  const highRisk = segments.filter(s => s.level === "high");
  const medRisk  = segments.filter(s => s.level === "medium");

  const onSegmentsReadyRef = useRef(onSegmentsReady);
  useEffect(() => { onSegmentsReadyRef.current = onSegmentsReady; });

  const prevKeyRef = useRef(null);

  // Notify parent only when the actual segment data changes.
  // onSegmentsReady is intentionally kept OUT of the dep array via ref —
  // this is the canonical pattern to avoid update-depth loops.
  useEffect(() => {
    const next = enabled ? segments : [];
    const key = enabled
      ? next.map(s => `${s.stopName}:${s.riskScore}:${s.level}`).join("|")
      : "disabled";
    if (prevKeyRef.current === key) return;
    prevKeyRef.current = key;
    onSegmentsReadyRef.current?.(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments, enabled]);

  // ── Auto voice alert ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !voiceEnabled || !onSpeak || voicedRef.current || !segments.length) return;
    voicedRef.current = true;

    // Compute inside effect to avoid new-array-reference re-trigger loop
    const high = segments.filter(s => s.level === "high");

    const topRisk = [...segments].sort((a, b) => b.riskScore - a.riskScore)[0];
    if (topRisk && topRisk.riskScore > 50) {
      const msg = topRisk.level === "high"
        ? `Warning! High risk detected near ${topRisk.stopName}. Risk score is ${topRisk.riskScore}. ${topRisk.alerts[0]?.replace(/[^\w\s,.!?]/g, "") || ""}`
        : `Caution. Medium risk area ahead near ${topRisk.stopName}. ${topRisk.alerts[0]?.replace(/[^\w\s,.!?]/g, "") || ""}`;
      setTimeout(() => onSpeak(msg), 2500);
    }

    if (high.length > 0) {
      setTimeout(() =>
        onSpeak(`Predictive Risk System: ${high.length} high risk segment${high.length > 1 ? "s" : ""} detected on your route. Please review alerts.`),
        8000
      );
    }
  // highRisk intentionally excluded – computed inside to avoid new-array-reference loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments, enabled, voiceEnabled, onSpeak]);

  // ── Toggle persistence ─────────────────────────────────────────────────────
  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem("truckPredictiveAlerts", String(next));
    voicedRef.current = false; // allow re-speech if re-enabled
  };

  // ── Reset voice fired when new route comes in ──────────────────────────────
  useEffect(() => { voicedRef.current = false; }, [stops]);

  if (!stops || stops.length < 2) return null;

  const displaySegments = showAll ? segments : segments.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* ── Toggle Header ── */}
      <button
        onClick={toggle}
        className="predictive-toggle"
        style={{
          width: "100%", padding: "11px 16px",
          borderRadius: 12, border: "1.5px solid",
          borderColor: enabled
            ? (darkMode ? "rgba(220,53,69,0.4)" : "#fca5a5")
            : (darkMode ? "#30363d" : "#e1e8f0"),
          background: enabled
            ? (darkMode ? "rgba(220,53,69,0.08)" : "#fff5f5")
            : "transparent",
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 10,
          transition: "all 0.25s ease",
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: enabled ? "#DC3545" : (darkMode ? "#21262d" : "#f1f5f9"),
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {enabled ? <Bell size={15} color="white" /> : <BellOff size={15} />}
        </div>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            🔮 Predictive Risk Alerts
            <span style={{
              fontSize: 9, padding: "2px 6px", borderRadius: 20, fontWeight: 700,
              background: enabled ? "#DC3545" : "#6b7280",
              color: "white", textTransform: "uppercase",
            }}>
              {enabled ? "ON" : "OFF"}
            </span>
          </div>
          <div style={{ fontSize: 11, opacity: 0.55, marginTop: 1 }}>
            {enabled ? `${highRisk.length} high · ${medRisk.length} medium risk segments` : "Click to enable AI risk prediction"}
          </div>
        </div>
        <Zap size={14} color={enabled ? "#DC3545" : "#6b7280"} />
      </button>

      {/* ── Expanded Panel ── */}
      {enabled && (
        <div className="risk-panel glass" style={{
          marginTop: 8,
          overflow: "hidden",
          animation: "fadeInDown 0.35s ease forwards",
        }}>
          {/* Overall score header */}
          <div style={{
            padding: "16px 16px 12px",
            background: darkMode
              ? "linear-gradient(135deg, rgba(11,94,215,0.08), rgba(220,53,69,0.05))"
              : "linear-gradient(135deg, #f0f6ff, #fff5f5)",
            borderBottom: `1px solid ${darkMode ? "#30363d" : "#f0f0f0"}`,
            display: "flex", alignItems: "center", gap: 14,
          }}>
            {/* Score ring */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <ScoreRing score={safetyScore} size={72} stroke={6} />
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ fontSize: 18, fontWeight: 800,
                  color: safetyScore >= 70 ? "#198754" : safetyScore >= 50 ? "#f59e0b" : "#DC3545"
                }}>
                  {safetyScore}
                </div>
                <div style={{ fontSize: 8, opacity: 0.6, fontWeight: 600 }}>SAFETY</div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>Route Safety Score</div>
              <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 6 }}>
                AI analysis across {segments.length} stops
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {highRisk.length > 0 && (
                  <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#fee2e2", color: "#991b1b" }}>
                    🔴 {highRisk.length} High
                  </span>
                )}
                {medRisk.length > 0 && (
                  <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>
                    🟠 {medRisk.length} Medium
                  </span>
                )}
                {segments.filter(s => s.level === "safe").length > 0 && (
                  <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#d1fae5", color: "#065f46" }}>
                    🟢 {segments.filter(s => s.level === "safe").length} Safe
                  </span>
                )}
              </div>
            </div>

            <Shield size={20} color={safetyScore >= 70 ? "#198754" : safetyScore >= 50 ? "#f59e0b" : "#DC3545"} />
          </div>

          {/* Segment cards */}
          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
              📍 Per-Stop Risk Breakdown
            </div>
            {displaySegments.map((seg, i) => (
              <SegmentCard key={`${seg.lat}-${seg.lon}-${i}`} seg={seg} darkMode={darkMode} idx={i} />
            ))}
            {segments.length > 3 && (
              <button
                onClick={() => setShowAll(v => !v)}
                style={{
                  width: "100%", padding: "8px",
                  background: "transparent", border: "1px dashed",
                  borderColor: darkMode ? "#30363d" : "#e1e8f0",
                  borderRadius: 8, cursor: "pointer", fontSize: 12,
                  color: "#0B5ED7", fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}
              >
                {showAll
                  ? <><ChevronUp size={13} /> Show Less</>
                  : <><ChevronDown size={13} /> Show {segments.length - 3} More Stops</>
                }
              </button>
            )}
          </div>

          {/* Voice status */}
          {voiceEnabled && (
            <div style={{
              margin: "0 12px 12px",
              padding: "8px 12px", borderRadius: 8,
              background: darkMode ? "rgba(25,135,84,0.1)" : "#f0fdf4",
              border: "1px solid #bbf7d0",
              fontSize: 11, color: "#198754",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              🔊 Voice alerts active — you'll be notified of high-risk segments
            </div>
          )}
        </div>
      )}
    </div>
  );
}

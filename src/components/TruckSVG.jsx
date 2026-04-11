/**
 * TruckSVG — Inline SVG illustration of a truck.
 * Props:
 *   size   (number)  — overall width in px (height auto-scaled)
 *   status ("operational" | "service_due" | "in_repair") — colors the body
 */
export default function TruckSVG({ size = 220, status = "operational" }) {
  const bodyColor =
    status === "operational"  ? "#0B5ED7" :
    status === "service_due"  ? "#f59e0b" :
    status === "in_repair"    ? "#DC3545" : "#0B5ED7";

  const cabinColor =
    status === "operational"  ? "#0847b0" :
    status === "service_due"  ? "#d97706" :
    status === "in_repair"    ? "#b02a37" : "#0847b0";

  return (
    <svg
      width={size}
      height={size * 0.52}
      viewBox="0 0 440 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Truck illustration"
      role="img"
    >
      {/* ── Road shadow ───────────────────────────────────────────────────── */}
      <ellipse cx="220" cy="218" rx="200" ry="10" fill="rgba(0,0,0,0.08)" />

      {/* ── Trailer body ──────────────────────────────────────────────────── */}
      <rect x="10" y="60" width="280" height="130" rx="6" fill={bodyColor} />
      {/* Trailer highlight */}
      <rect x="10" y="60" width="280" height="32" rx="6" fill={cabinColor} opacity="0.5" />
      {/* Trailer side ribs */}
      <line x1="80"  y1="60" x2="80"  y2="190" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
      <line x1="150" y1="60" x2="150" y2="190" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
      <line x1="220" y1="60" x2="220" y2="190" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
      {/* Trailer rear door */}
      <rect x="268" y="80" width="22" height="110" rx="2" fill={cabinColor} opacity="0.4" />
      <line x1="279" y1="80" x2="279" y2="190" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      <circle cx="274" cy="135" r="4" fill="rgba(255,255,255,0.4)" />

      {/* ── Cabin ─────────────────────────────────────────────────────────── */}
      <path
        d="M292 80 L292 170 L430 170 L430 100 Q430 80 410 80 Z"
        fill={cabinColor}
      />
      {/* Cabin roof curve */}
      <path d="M295 80 Q340 55 410 80" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none"/>

      {/* Windshield */}
      <path
        d="M310 90 Q330 72 410 90 L410 140 L310 140 Z"
        fill="#93c5fd"
        opacity="0.7"
      />
      {/* Windshield glare */}
      <path d="M315 92 Q340 78 390 92" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

      {/* Side window */}
      <rect x="296" y="92" width="12" height="44" rx="3" fill="#93c5fd" opacity="0.5" />

      {/* Door line */}
      <line x1="360" y1="100" x2="360" y2="170" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      {/* Door handle */}
      <rect x="356" y="135" width="10" height="4" rx="2" fill="rgba(255,255,255,0.5)" />

      {/* Headlights */}
      <rect x="422" y="102" width="10" height="16" rx="3" fill="#fef08a" />
      <rect x="422" y="122" width="10" height="8"  rx="2" fill="#f97316" opacity="0.8" />

      {/* ── Exhaust pipe ──────────────────────────────────────────────────── */}
      <rect x="388" y="50" width="8" height="32" rx="3" fill="#475569" />
      {/* Smoke puffs */}
      <circle cx="392" cy="42" r="7"  fill="#94a3b8" opacity="0.35" />
      <circle cx="398" cy="30" r="5"  fill="#94a3b8" opacity="0.25" />
      <circle cx="386" cy="22" r="4"  fill="#94a3b8" opacity="0.18" />

      {/* ── Chassis / undercarriage ───────────────────────────────────────── */}
      <rect x="30"  y="188" width="360" height="12" rx="3" fill="#1e293b" />

      {/* ── Wheels ─────────────────────────────────────────────────────────── */}
      {/* Rear left */}
      <circle cx="70"  cy="200" r="24" fill="#1e293b" />
      <circle cx="70"  cy="200" r="16" fill="#334155" />
      <circle cx="70"  cy="200" r="8"  fill="#475569" />
      <circle cx="70"  cy="200" r="3"  fill="#64748b" />
      {/* Rear right (double) */}
      <circle cx="130" cy="200" r="24" fill="#1e293b" />
      <circle cx="130" cy="200" r="16" fill="#334155" />
      <circle cx="130" cy="200" r="8"  fill="#475569" />
      <circle cx="130" cy="200" r="3"  fill="#64748b" />
      {/* Drive axle left */}
      <circle cx="320" cy="200" r="24" fill="#1e293b" />
      <circle cx="320" cy="200" r="16" fill="#334155" />
      <circle cx="320" cy="200" r="8"  fill="#475569" />
      <circle cx="320" cy="200" r="3"  fill="#64748b" />
      {/* Drive axle right */}
      <circle cx="390" cy="200" r="24" fill="#1e293b" />
      <circle cx="390" cy="200" r="16" fill="#334155" />
      <circle cx="390" cy="200" r="8"  fill="#475569" />
      <circle cx="390" cy="200" r="3"  fill="#64748b" />

      {/* ── Mudflaps ───────────────────────────────────────────────────────── */}
      <rect x="44"  y="186" width="6"  height="22" rx="2" fill="#0f172a" />
      <rect x="152" y="186" width="6"  height="22" rx="2" fill="#0f172a" />
      <rect x="412" y="186" width="6"  height="22" rx="2" fill="#0f172a" />

      {/* ── Company "TruckAI" text on body ─────────────────────────────────── */}
      <text
        x="148"
        y="140"
        textAnchor="middle"
        fontFamily="Outfit, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="rgba(255,255,255,0.9)"
        letterSpacing="2"
      >
        TruckAI
      </text>
      {/* Sub-text */}
      <text
        x="148"
        y="162"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="10"
        fill="rgba(255,255,255,0.5)"
        letterSpacing="1"
      >
        SMART LOGISTICS
      </text>

      {/* ── Status light on cabin roof ─────────────────────────────────────── */}
      <rect x="370" y="73" width="28" height="10" rx="4" fill={
        status === "service_due" ? "#f59e0b" :
        status === "in_repair"   ? "#DC3545" : "#22c55e"
      } />
    </svg>
  );
}

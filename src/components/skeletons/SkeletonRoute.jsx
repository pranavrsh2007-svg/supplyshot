import SkeletonBox from "./SkeletonBox";
import SkeletonText from "./SkeletonText";
import SkeletonMap from "./SkeletonMap";

/**
 * SkeletonRoute – full Route Planner page skeleton
 * Mimics: form inputs + route summary bar + 3 route option cards + map
 */
export default function SkeletonRoute() {
  return (
    <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20, alignItems: "start" }}>
      {/* ── Left panel ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Form card */}
        <div style={{ borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Title */}
          <SkeletonBox height={18} width="55%" borderRadius={8} />

          {/* FROM label + input */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <SkeletonBox height={11} width="30px" borderRadius={4} />
            <div style={{ display: "flex", gap: 8 }}>
              <SkeletonBox height={40} borderRadius={10} style={{ flex: 1 }} />
              <SkeletonBox width={40} height={40} borderRadius={10} />
            </div>
          </div>

          {/* Halt */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <SkeletonBox height={11} width="50px" borderRadius={4} />
            <div style={{ display: "flex", gap: 8 }}>
              <SkeletonBox height={40} borderRadius={10} style={{ flex: 1 }} />
              <SkeletonBox width={40} height={40} borderRadius={10} />
            </div>
          </div>

          {/* Dashed add halt */}
          <SkeletonBox height={38} borderRadius={10} />

          {/* TO label + input */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <SkeletonBox height={11} width="20px" borderRadius={4} />
            <div style={{ display: "flex", gap: 8 }}>
              <SkeletonBox height={40} borderRadius={10} style={{ flex: 1 }} />
              <SkeletonBox width={40} height={40} borderRadius={10} />
            </div>
          </div>

          {/* Plan Route button */}
          <SkeletonBox height={44} borderRadius={10} />
        </div>

        {/* Route option cards ×3 */}
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", borderLeft: "4px solid rgba(0,0,0,0.08)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <SkeletonText lines={2} widths={["60%", "40%"]} height={13} gap={6} />
              <SkeletonBox width={32} height={32} borderRadius={8} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[...Array(3)].map((_, j) => (
                <div key={j} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <SkeletonBox height={18} width="70%" borderRadius={6} />
                  <SkeletonBox height={10} width="50%" borderRadius={4} />
                </div>
              ))}
            </div>
            <SkeletonText lines={2} widths={["70%", "55%"]} height={11} gap={4} />
          </div>
        ))}
      </div>

      {/* ── Right panel: map ── */}
      <SkeletonMap height={560} />
    </div>
  );
}

import SkeletonBox from "./SkeletonBox";
import SkeletonText from "./SkeletonText";
import SkeletonCard from "./SkeletonCard";
import SkeletonMap from "./SkeletonMap";

/**
 * SkeletonStops – Smart Stops page skeleton
 * Mimics: filter buttons + 5-6 service cards + map
 */
export default function SkeletonStops() {
  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Timeline bar */}
      <div style={{ borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)", padding: "16px 24px" }}>
        <SkeletonBox height={16} width="120px" borderRadius={8} style={{ marginBottom: 16 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <SkeletonBox width={100} height={56} borderRadius={12} />
              {i < 4 && <SkeletonBox width={16} height={16} borderRadius={4} />}
            </div>
          ))}
        </div>
      </div>

      {/* Split: services list + map */}
      <div style={{ display: "flex", gap: 16, minHeight: 500 }}>
        {/* Left: filters + cards */}
        <div style={{ flex: "0 0 420px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Filter buttons */}
          <div style={{ borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)", padding: 14 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[...Array(6)].map((_, i) => (
                <SkeletonBox key={i} width={`${60 + i * 10}px`} height={34} borderRadius={20} />
              ))}
            </div>
          </div>

          {/* Service cards */}
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)", padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <SkeletonBox width={32} height={32} borderRadius="50%" />
                  <SkeletonText lines={2} widths={["100px", "70px"]} height={13} gap={5} />
                </div>
                <SkeletonText lines={2} widths={["50px", "28px"]} height={12} gap={4} />
              </div>
              <SkeletonText lines={2} widths={["80%", "55%"]} height={11} gap={4} style={{ marginBottom: 12 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <SkeletonBox height={34} borderRadius={8} style={{ flex: 1 }} />
                <SkeletonBox height={34} borderRadius={8} style={{ flex: 1 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Right: map */}
        <div style={{ flex: 1 }}>
          <SkeletonMap height="100%" borderRadius={16} />
        </div>
      </div>
    </div>
  );
}

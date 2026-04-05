import SkeletonBox from "./SkeletonBox";
import SkeletonText from "./SkeletonText";

/**
 * SkeletonMap – placeholder for Leaflet/map views
 * Props: height, borderRadius
 */
export default function SkeletonMap({ height = 400, borderRadius = 16 }) {
  return (
    <div style={{ position: "relative", width: "100%", height, borderRadius, overflow: "hidden" }}>
      {/* Main shimmer */}
      <SkeletonBox width="100%" height={height} borderRadius={borderRadius} />

      {/* Fake map overlays */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: 36,
            opacity: 0.18,
            filter: "grayscale(1)",
          }}
        >
          🗺️
        </div>
        <SkeletonText lines={1} widths={["120px"]} height={12} />
      </div>

      {/* Fake zoom controls top-left */}
      <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        <SkeletonBox width={30} height={30} borderRadius={6} />
        <SkeletonBox width={30} height={30} borderRadius={6} />
      </div>
    </div>
  );
}

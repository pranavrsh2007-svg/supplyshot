import SkeletonBox from "./SkeletonBox";
import SkeletonText from "./SkeletonText";

/**
 * SkeletonSidebar – sidebar nav skeleton
 */
export default function SkeletonSidebar() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 16 }}>
      {/* Logo area */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "0 4px" }}>
        <SkeletonBox width={36} height={36} borderRadius={10} />
        <SkeletonBox height={18} width="110px" borderRadius={8} />
      </div>

      {/* Nav links */}
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10 }}>
          <SkeletonBox width={18} height={18} borderRadius={5} />
          <SkeletonBox height={13} width={`${70 + (i % 3) * 15}px`} borderRadius={6} />
        </div>
      ))}

      {/* Divider */}
      <SkeletonBox height={1} style={{ margin: "10px 0" }} />

      {/* User chip at bottom */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginTop: 8 }}>
        <SkeletonBox width={34} height={34} borderRadius="50%" />
        <SkeletonText lines={2} widths={["80px", "55px"]} height={12} gap={4} />
      </div>
    </div>
  );
}

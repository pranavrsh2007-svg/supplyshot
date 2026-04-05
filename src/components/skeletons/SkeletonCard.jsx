import SkeletonBox from "./SkeletonBox";
import SkeletonText from "./SkeletonText";

/**
 * SkeletonCard – mimics a generic stat / info card
 * Props: showIcon, lines, style
 */
export default function SkeletonCard({ showIcon = true, lines = 2, style = {} }) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.06)",
        padding: 20,
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        ...style,
      }}
    >
      {showIcon && (
        <SkeletonBox width={44} height={44} borderRadius={12} style={{ flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <SkeletonText lines={lines} widths={["60%", "40%"]} />
        <SkeletonBox height={10} width="30%" borderRadius={6} />
      </div>
    </div>
  );
}

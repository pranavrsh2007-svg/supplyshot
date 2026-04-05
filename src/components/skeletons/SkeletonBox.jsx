/**
 * SkeletonBox – generic shimmer block
 * Props: width, height, borderRadius, style
 */
export default function SkeletonBox({ width = "100%", height = 16, borderRadius = 8, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, flexShrink: 0, ...style }}
    />
  );
}

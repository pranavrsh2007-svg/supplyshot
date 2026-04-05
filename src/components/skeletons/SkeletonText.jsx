import SkeletonBox from "./SkeletonBox";

/**
 * SkeletonText – renders 1–N shimmer text lines
 * Props: lines, widths (array), gap, height
 */
export default function SkeletonText({ lines = 1, widths, gap = 8, height = 14 }) {
  const defaultWidths = ["100%", "75%", "85%", "60%", "90%"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          width={widths?.[i] ?? defaultWidths[i % defaultWidths.length]}
          height={height}
          borderRadius={6}
        />
      ))}
    </div>
  );
}

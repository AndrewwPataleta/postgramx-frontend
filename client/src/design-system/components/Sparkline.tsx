interface SparklineProps {
  data: number[];
  height?: number;
  className?: string;
}

export const Sparkline = ({
  data,
  height = 24,
  className = "",
}: SparklineProps) => {
  if (!data || data.length < 2) {
    return null;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const width = 100;
  const pointSpacing = width / (data.length - 1);

  const points = data
    .map((value, index) => {
      const x = index * pointSpacing;
      const y = height - ((value - min) / range) * (height * 0.8) - height * 0.1;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`inline-block ${className}`}
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        points={points}
        fill="url(#gradient)"
        opacity="0.2"
        strokeWidth="0"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

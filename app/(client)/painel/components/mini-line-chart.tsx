export default function MiniLineChart({ points }: { points: number[] }) {
  const w = 560;
  const h = 180;
  const pad = 14;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const span = Math.max(max - min, 1);

  const coords = points.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (points.length - 1);
    const y = pad + ((max - v) * (h - pad * 2)) / span;
    return { x, y };
  });

  const d = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[210px] w-full">
      <defs>
        <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path
        d={d}
        fill="none"
        stroke="url(#line)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}


// Minimal inline SVG icons (stroke = currentColor), terminal-clean.
type P = { size?: number };
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function MarketsIcon({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <path d="M3 3v18h18" />
      <path d="M7 14l3-4 3 3 4-6" />
    </svg>
  );
}

export function BasketIcon({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <path d="M5 9h14l-1.2 9.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 9Z" />
      <path d="M9 9 12 3l3 6" />
      <path d="M9.5 13v3M14.5 13v3" />
    </svg>
  );
}

export function LayersIcon({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <path d="M12 3 2 8l10 5 10-5-10-5Z" />
      <path d="M2 13l10 5 10-5" />
    </svg>
  );
}

export function BellIcon({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function SparkIcon({ size = 16 }: P) {
  return (
    <svg {...base(size)}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8.5 13.4 11 16 12l-2.6 1L12 15.5 10.6 13 8 12l2.6-1L12 8.5Z" />
    </svg>
  );
}

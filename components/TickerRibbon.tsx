"use client";

import { useReducedMotion } from "motion/react";
import type { PricePoint } from "../hooks/useStockPrices";
import { formatPrice } from "../lib/pricing";

// Exchange-style scrolling price ribbon (Ondo-inspired). Seamless loop via a
// duplicated track; paused for reduced-motion users.
export function TickerRibbon({ points }: { points: PricePoint[] }) {
  const reduce = useReducedMotion();
  const items = points.filter((p) => p.price !== null);
  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <div
      style={{
        overflow: "hidden",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.4)",
        maskImage:
          "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          gap: 0,
          whiteSpace: "nowrap",
          animation: reduce ? "none" : "stax-marquee 48s linear infinite",
          willChange: "transform",
        }}
      >
        {loop.map((p, i) => (
          <span
            key={`${p.token.symbol}-${i}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 20px",
              borderRight: "1px solid rgba(255,255,255,0.05)",
              fontSize: 12,
            }}
          >
            <span className="mono" style={{ fontWeight: 700, color: "var(--fg-2)" }}>
              {p.token.symbol}
            </span>
            <span
              className="kore-money"
              style={{ color: p.stale ? "var(--muted)" : "var(--fg-0)" }}
            >
              ${formatPrice(p.price as bigint)}
            </span>
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: p.stale ? "var(--warn)" : "var(--up)",
                boxShadow: p.stale ? "none" : "0 0 6px var(--up)",
              }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}

"use client";

import type { PricePoint } from "../hooks/useStockPrices";
import { PriceTicker } from "./PriceTicker";

export function StockGrid({
  points,
  selected,
  onToggle,
}: {
  points: PricePoint[];
  selected: Set<string>;
  onToggle: (symbol: string) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
        gap: 12,
      }}
    >
      {points.map((p) => {
        const isSel = selected.has(p.token.symbol);
        return (
          <button
            key={p.token.symbol}
            onClick={() => onToggle(p.token.symbol)}
            className={`glass${isSel ? " accent-glow" : ""}`}
            style={{
              textAlign: "left",
              padding: 14,
              cursor: "pointer",
              color: "var(--text)",
              transition: "transform .15s ease",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="mono" style={{ fontWeight: 600 }}>
                {p.token.symbol}
              </span>
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 5,
                  border: "1px solid var(--border)",
                  background: isSel ? "var(--accent)" : "transparent",
                }}
              />
            </div>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              {p.token.name}
            </span>
            <PriceTicker price={p.price} stale={p.stale} />
          </button>
        );
      })}
    </div>
  );
}

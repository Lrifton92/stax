"use client";

import { useState } from "react";
import type { PricePoint } from "../hooks/useStockPrices";
import { PriceTicker } from "./PriceTicker";

// ticker (without the trailing "c") -> company domain for the logo
const DOMAINS: Record<string, string> = {
  AAPL: "apple.com",
  AMZN: "amazon.com",
  COIN: "coinbase.com",
  CRCL: "circle.com",
  GOOGL: "google.com",
  INTC: "intel.com",
  META: "meta.com",
  MSFT: "microsoft.com",
  MSTR: "strategy.com",
  NVDA: "nvidia.com",
  SNDK: "sandisk.com",
  SPCX: "spacex.com",
  TSLA: "tesla.com",
};

function TokenLogo({ symbol }: { symbol: string }) {
  const ticker = symbol.replace(/c$/, "");
  const domain = DOMAINS[ticker];
  const [failed, setFailed] = useState(!domain);
  const box: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: 10,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    overflow: "hidden",
  };
  if (failed) {
    return (
      <div style={box}>
        <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--fg-2)" }}>
          {ticker.slice(0, 2)}
        </span>
      </div>
    );
  }
  return (
    <div style={box}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
        alt={ticker}
        width={22}
        height={22}
        style={{ width: 22, height: 22, objectFit: "contain" }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

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
        gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
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
              color: "var(--fg-0)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              borderRadius: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <TokenLogo symbol={p.token.symbol} />
              <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                <span className="mono" style={{ fontWeight: 700, fontSize: 13 }}>
                  {p.token.symbol}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.token.name}
                </span>
              </div>
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 6,
                  border: "1px solid var(--border-strong)",
                  background: isSel ? "var(--accent)" : "transparent",
                  flexShrink: 0,
                }}
              />
            </div>
            <PriceTicker price={p.price} stale={p.stale} />
          </button>
        );
      })}
    </div>
  );
}

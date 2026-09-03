"use client";

import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion, useReducedMotion } from "motion/react";
import type { PricePoint } from "../hooks/useStockPrices";
import { PriceTicker } from "./PriceTicker";

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

const MIN_CARD = 230;
const GAP = 12;
const ROW_H = 128; // card height + gap

function TokenLogo({ symbol }: { symbol: string }) {
  const ticker = symbol.replace(/c$/, "");
  const domain = DOMAINS[ticker];
  const [failed, setFailed] = useState(!domain);
  const box: React.CSSProperties = {
    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
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
        width={22} height={22}
        style={{ width: 22, height: 22, objectFit: "contain" }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function Card({
  p, isSel, onToggle, reduce,
}: {
  p: PricePoint; isSel: boolean; onToggle: (s: string) => void; reduce: boolean;
}) {
  return (
    <motion.button
      whileHover={reduce ? undefined : { y: -3 }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.15 }}
      onClick={() => onToggle(p.token.symbol)}
      className={`glass${isSel ? " accent-glow" : ""}`}
      style={{
        textAlign: "left", padding: 14, cursor: "pointer", color: "var(--fg-0)",
        display: "flex", flexDirection: "column", gap: 10, borderRadius: 16,
        height: ROW_H - GAP, width: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <TokenLogo symbol={p.token.symbol} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
          <span className="mono" style={{ fontWeight: 700, fontSize: 13 }}>{p.token.symbol}</span>
          <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {p.token.name}
          </span>
        </div>
        <span style={{ width: 18, height: 18, borderRadius: 6, border: "1px solid var(--border-strong)", background: isSel ? "var(--accent)" : "transparent", flexShrink: 0, transition: "background 0.15s ease" }} />
      </div>
      <PriceTicker price={p.price} stale={p.stale} />
    </motion.button>
  );
}

// Virtualized grid: only visible rows are mounted, so it scales to thousands of
// assets. Column count is responsive; the scroll container is height-bounded.
export function StockGrid({
  points, selected, onToggle, maxHeight = "58vh",
}: {
  points: PricePoint[];
  selected: Set<string>;
  onToggle: (symbol: string) => void;
  maxHeight?: number | string;
}) {
  const reduce = useReducedMotion();
  const parentRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(1);

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      setCols(Math.max(1, Math.floor((w + GAP) / (MIN_CARD + GAP))));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rowCount = Math.ceil(points.length / cols);
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_H,
    overscan: 6,
  });

  return (
    <div
      ref={parentRef}
      style={{ maxHeight, overflowY: "auto", position: "relative" }}
    >
      <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative", width: "100%" }}>
        {rowVirtualizer.getVirtualItems().map((vRow) => {
          const start = vRow.index * cols;
          const rowItems = points.slice(start, start + cols);
          return (
            <div
              key={vRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${vRow.start}px)`,
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gap: GAP,
                paddingBottom: GAP,
              }}
            >
              {rowItems.map((p) => (
                <Card
                  key={p.token.symbol}
                  p={p}
                  isSel={selected.has(p.token.symbol)}
                  onToggle={onToggle}
                  reduce={!!reduce}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

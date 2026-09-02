"use client";

import { useEffect, useState } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { Shell } from "../components/Shell";
import { StockGrid } from "../components/StockGrid";
import { BasketBuilder } from "../components/BasketBuilder";
import { useStockPrices } from "../hooks/useStockPrices";

export default function Page() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const points = useStockPrices();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [isFrameReady, setFrameReady]);

  function toggle(symbol: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(symbol) ? next.delete(symbol) : next.add(symbol);
      return next;
    });
  }

  return (
    <Shell>
      <section style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 26, margin: "6px 0 6px" }}>
          Build a basket of tokenized stocks
        </h1>
        <p style={{ color: "var(--muted)", margin: 0, maxWidth: 620, fontSize: 14 }}>
          Pick Coinbase tokenized stocks, weight them, and save your basket
          onchain on Base. Live prices are Chainlink feeds, multiplier- and
          staleness-aware. Saving and alerts work for any wallet; trading is
          enabled for eligible accounts.
        </p>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 340px",
          gap: 18,
          alignItems: "start",
        }}
      >
        <StockGrid
          points={points}
          selected={selected}
          onToggle={toggle}
        />
        <BasketBuilder points={points} selected={[...selected]} />
      </div>
    </Shell>
  );
}

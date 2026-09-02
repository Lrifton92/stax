"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { Shell } from "../components/Shell";
import { StockGrid } from "../components/StockGrid";
import { BasketBuilder } from "../components/BasketBuilder";
import { BasketsDashboard } from "../components/BasketsDashboard";
import { AlertForm } from "../components/AlertForm";
import { EligibilityBadge } from "../components/EligibilityBadge";
import { useStockPrices } from "../hooks/useStockPrices";
import { useBaskets } from "../hooks/useBaskets";

export default function Page() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const { address } = useAccount();
  const points = useStockPrices();
  const { baskets } = useBaskets(address);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedBasketId, setSelectedBasketId] = useState<bigint | null>(null);

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

  const activeBasket =
    baskets.find((b) => b.id === selectedBasketId) ?? baskets[0] ?? null;

  return (
    <Shell>
      <section style={{ marginBottom: 22 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            margin: "6px 0 6px",
          }}
        >
          <h1 style={{ fontSize: 26, margin: 0 }}>
            Build a basket of tokenized stocks
          </h1>
          <EligibilityBadge />
        </div>
        <p
          style={{
            color: "var(--fg-3)",
            margin: "8px 0 0",
            maxWidth: 560,
            fontSize: 11.5,
            lineHeight: 1.55,
            letterSpacing: "0.01em",
          }}
        >
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
        <StockGrid points={points} selected={selected} onToggle={toggle} />
        <BasketBuilder points={points} selected={[...selected]} />
      </div>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 18, margin: "0 0 12px" }}>My baskets</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 340px",
            gap: 18,
            alignItems: "start",
          }}
        >
          <BasketsDashboard
            address={address}
            selectedId={activeBasket?.id ?? null}
            onSelect={setSelectedBasketId}
          />
          <AlertForm basket={activeBasket} />
        </div>
      </section>
    </Shell>
  );
}

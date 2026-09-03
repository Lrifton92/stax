"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { motion, useReducedMotion } from "motion/react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { Shell } from "../components/Shell";
import { StockGrid } from "../components/StockGrid";
import { BasketBuilder } from "../components/BasketBuilder";
import { BasketsDashboard } from "../components/BasketsDashboard";
import { AlertForm } from "../components/AlertForm";
import { EligibilityBadge } from "../components/EligibilityBadge";
import { TickerRibbon } from "../components/TickerRibbon";
import { SectionHeader } from "../components/SectionHeader";
import { MarketsIcon, LayersIcon } from "../components/icons";
import { useStockPrices } from "../hooks/useStockPrices";
import { useBaskets } from "../hooks/useBaskets";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span className="kore-money" style={{ fontSize: 20 }}>
        {value}
      </span>
      <span
        style={{
          fontSize: 9.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--fg-3)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

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
  const reduce = useReducedMotion();
  const live = points.filter((p) => p.price !== null && !p.stale).length;

  const reveal = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <Shell>
      {/* full-bleed exchange ticker ribbon */}
      <div style={{ margin: "-26px -22px 22px" }}>
        <TickerRibbon points={points} />
      </div>

      <motion.section
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        style={{ marginBottom: 26 }}
      >
        <motion.div
          variants={reveal}
          style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}
        >
          <h1 style={{ fontSize: 30, margin: 0, letterSpacing: "-0.01em", lineHeight: 1.1 }}>
            Own the market. Onchain.
          </h1>
          <EligibilityBadge />
        </motion.div>

        <motion.p
          variants={reveal}
          style={{
            color: "var(--fg-3)",
            margin: "10px 0 0",
            maxWidth: 560,
            fontSize: 11.5,
            lineHeight: 1.55,
            letterSpacing: "0.01em",
          }}
        >
          Build a basket of Coinbase tokenized stocks, weight it, and save it
          onchain on Base. Live prices are Chainlink feeds, multiplier- and
          staleness-aware. Saving and alerts work for any wallet; trading is
          enabled for eligible accounts.
        </motion.p>

        <motion.div
          variants={reveal}
          style={{
            display: "flex",
            gap: 34,
            marginTop: 20,
            flexWrap: "wrap",
          }}
        >
          <Stat value="13" label="Tokenized stocks" />
          <Stat value={live > 0 ? String(live) : "—"} label="Live Chainlink feeds" />
          <Stat value="Base" label="Onchain · gasless-ready" />
        </motion.div>
      </motion.section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 360px",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* LEFT: markets + saved baskets */}
        <div style={{ display: "flex", flexDirection: "column", gap: 30, minWidth: 0 }}>
          <section>
            <SectionHeader
              icon={<MarketsIcon />}
              title="Markets"
              meta="13 assets · live"
            />
            <StockGrid points={points} selected={selected} onToggle={toggle} />
          </section>

          <section>
            <SectionHeader
              icon={<LayersIcon />}
              title="My baskets"
              meta={baskets.length > 0 ? `${baskets.length} saved` : undefined}
            />
            <BasketsDashboard
              address={address}
              selectedId={activeBasket?.id ?? null}
              onSelect={setSelectedBasketId}
            />
          </section>
        </div>

        {/* RIGHT: sticky control panel — builder + alerts */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "sticky",
            top: 16,
          }}
        >
          <BasketBuilder points={points} selected={[...selected]} />
          <AlertForm basket={activeBasket} />
        </div>
      </div>
    </Shell>
  );
}

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
import { AnimatedWords } from "../components/AnimatedWords";
import { SectionHeader } from "../components/SectionHeader";
import { MarketsIcon, LayersIcon } from "../components/icons";
import { sectorOf } from "../lib/b20";
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

  // Search + sector filter — keep the grid usable as the asset list grows.
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All");
  const q = query.trim().toLowerCase();
  const sectors = ["All", ...Array.from(new Set(points.map((p) => sectorOf(p.token.symbol)))).sort()];
  const filtered = points.filter((p) => {
    const matchQ =
      !q ||
      p.token.symbol.toLowerCase().includes(q) ||
      p.token.name.toLowerCase().includes(q);
    const matchS = sector === "All" || sectorOf(p.token.symbol) === sector;
    return matchQ && matchS;
  });

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
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <AnimatedWords
            text="Own the market. Onchain."
            as="h1"
            style={{ fontSize: 30, letterSpacing: "-0.01em", lineHeight: 1.1 }}
          />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <EligibilityBadge />
          </motion.span>
        </div>

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
              meta={`${points.length} assets · live`}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ticker or company…"
              className="mono"
              style={{
                width: "100%",
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                color: "var(--text)",
                padding: "11px 14px",
                fontSize: 13,
                marginBottom: 12,
              }}
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {sectors.map((s) => {
                const on = sector === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSector(s)}
                    className="mono"
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "6px 12px",
                      borderRadius: 999,
                      cursor: "pointer",
                      color: on ? "var(--accent)" : "var(--fg-3)",
                      background: on ? "var(--accent-soft)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${on ? "rgba(34,197,94,0.4)" : "var(--border)"}`,
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {filtered.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 13, padding: "20px 4px" }}>
                No asset matches your filters.
              </p>
            ) : (
              <StockGrid points={filtered} selected={selected} onToggle={toggle} />
            )}
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
            paddingLeft: 20,
            borderLeft: "1px solid var(--border)",
          }}
        >
          <BasketBuilder points={points} selected={[...selected]} />
          <AlertForm basket={activeBasket} />
        </div>
      </div>
    </Shell>
  );
}

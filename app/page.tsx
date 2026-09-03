"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAccount } from "wagmi";
import { motion, useReducedMotion } from "motion/react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { Shell } from "../components/Shell";
import { StockGrid } from "../components/StockGrid";
import { BasketBuilder } from "../components/BasketBuilder";
import { AIComposer } from "../components/AIComposer";
import { BasketsDashboard } from "../components/BasketsDashboard";
import { AlertForm } from "../components/AlertForm";
import { TradePanel } from "../components/TradePanel";
import { EligibilityBadge } from "../components/EligibilityBadge";
import { TickerRibbon } from "../components/TickerRibbon";
import { AnimatedWords } from "../components/AnimatedWords";
import { SectionHeader } from "../components/SectionHeader";
import { TabBar, type Tab } from "../components/TabBar";
import { MarketsIcon, LayersIcon, BasketIcon } from "../components/icons";
import { sectorOf } from "../lib/b20";
import { useStockPrices } from "../hooks/useStockPrices";
import { useBaskets } from "../hooks/useBaskets";
import { useMediaQuery } from "../hooks/useMediaQuery";

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
  // conviction weights from the AI composer; a manual edit clears them.
  const [aiWeights, setAiWeights] = useState<Record<string, number> | null>(null);
  const [tab, setTab] = useState("build");
  const narrow = useMediaQuery("(max-width: 820px)"); // Mini App / mobile

  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [isFrameReady, setFrameReady]);

  function toggle(symbol: string) {
    setAiWeights(null); // hand-editing the basket drops AI conviction weights
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(symbol) ? next.delete(symbol) : next.add(symbol);
      return next;
    });
  }

  function applyComposition(symbols: string[], weightsBps: number[]) {
    setSelected(new Set(symbols));
    setAiWeights(
      Object.fromEntries(symbols.map((s, i) => [s, weightsBps[i] ?? 0])),
    );
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

  const tabs: Tab[] = [
    { key: "build", label: "Build", icon: <BasketIcon size={15} /> },
    { key: "portfolio", label: "Portfolio", icon: <LayersIcon size={15} /> },
    { key: "trade", label: "Trade", icon: <MarketsIcon size={15} /> },
  ];

  const markets = (
    <section style={{ minWidth: 0 }}>
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
  );

  const panels: Record<string, ReactNode> = {
    build: (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: narrow ? "1fr" : "minmax(0, 1fr) 360px",
          gap: 20,
          alignItems: "start",
        }}
      >
        {markets}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: narrow ? "static" : "sticky",
            top: 16,
            paddingLeft: narrow ? 0 : 20,
            borderLeft: narrow ? "none" : "1px solid var(--border)",
            order: narrow ? -1 : 0, // compose panel on top on mobile
          }}
        >
          <AIComposer points={points} onCompose={applyComposition} />
          <BasketBuilder
            points={points}
            selected={[...selected]}
            onToggle={toggle}
            weightOverride={aiWeights}
          />
        </div>
      </div>
    ),
    portfolio: (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: narrow ? "1fr" : "minmax(0, 1fr) 340px",
          gap: 20,
          alignItems: "start",
        }}
      >
        <section style={{ minWidth: 0 }}>
          <SectionHeader
            icon={<LayersIcon />}
            title="My baskets"
            meta={baskets.length > 0 ? `${baskets.length} saved` : undefined}
          />
          <BasketsDashboard
            address={address}
            points={points}
            selectedId={activeBasket?.id ?? null}
            onSelect={setSelectedBasketId}
          />
        </section>
        <div
          style={{
            position: narrow ? "static" : "sticky",
            top: 16,
            paddingLeft: narrow ? 0 : 20,
            borderLeft: narrow ? "none" : "1px solid var(--border)",
          }}
        >
          <AlertForm basket={activeBasket} points={points} />
        </div>
      </div>
    ),
    trade: (
      <div style={{ maxWidth: 460 }}>
        <TradePanel basket={activeBasket} points={points} />
      </div>
    ),
  };

  return (
    <Shell>
      {/* full-bleed exchange ticker ribbon */}
      <div style={{ margin: "-26px -22px 22px" }}>
        <TickerRibbon points={points} />
      </div>

      {/* compact hero band */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <AnimatedWords
              text="Own the market. Onchain."
              as="h1"
              style={{ fontSize: 26, letterSpacing: "-0.01em", lineHeight: 1.1 }}
            />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <EligibilityBadge />
            </motion.span>
          </div>
        </div>
        <motion.div variants={reveal} style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
          <Stat value="13" label="Tokenized stocks" />
          <Stat value={live > 0 ? String(live) : "—"} label="Live Chainlink feeds" />
          <Stat value="Base" label="Mainnet · low fees" />
        </motion.div>
      </motion.section>

      <div style={{ marginBottom: 22 }}>
        <TabBar tabs={tabs} active={tab} onChange={setTab} />
      </div>

      {/* keyed remount plays a fade-in per tab — no AnimatePresence, so live
          price re-renders can't strand the enter animation at opacity 0. */}
      <motion.div
        key={tab}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {panels[tab]}
      </motion.div>
    </Shell>
  );
}

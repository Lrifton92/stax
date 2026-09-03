"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import type { PricePoint } from "../hooks/useStockPrices";
import { composeBasket } from "../lib/compose";
import { SectionHeader } from "./SectionHeader";
import { SparkIcon } from "./icons";

const EXAMPLES = [
  "AI chip makers",
  "Big tech + crypto",
  "Top 3 growth names",
  "Diversified",
];

// Natural-language basket composer: type an exposure, get a ranked selection
// pushed straight into the builder. Deterministic rule engine (lib/compose).
export function AIComposer({
  points,
  onCompose,
}: {
  points: PricePoint[];
  onCompose: (symbols: string[]) => void;
}) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [rationale, setRationale] = useState<string | null>(null);

  function run(q: string) {
    const text = q.trim();
    if (!text) return;
    const universe = points.map((p) => ({
      symbol: p.token.symbol,
      name: p.token.name,
    }));
    const { symbols, rationale } = composeBasket(text, universe);
    onCompose(symbols);
    setRationale(rationale);
  }

  return (
    <div
      className="glass"
      style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}
    >
      <SectionHeader icon={<SparkIcon />} title="AI composer" meta="beta" />

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run(query)}
          placeholder="Describe your exposure…"
          className="mono"
          style={{
            flex: 1,
            minWidth: 0,
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            color: "var(--text)",
            padding: "10px 12px",
            fontSize: 13,
          }}
        />
        <button
          onClick={() => run(query)}
          disabled={!query.trim()}
          className="btn-glass-accent"
          style={{ padding: "10px 16px", fontSize: 13, whiteSpace: "nowrap" }}
        >
          Compose
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => {
              setQuery(ex);
              run(ex);
            }}
            className="mono"
            style={{
              fontSize: 11,
              padding: "5px 10px",
              borderRadius: 999,
              cursor: "pointer",
              color: "var(--fg-3)",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
            }}
          >
            {ex}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {rationale && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mono"
            style={{
              fontSize: 11.5,
              lineHeight: 1.5,
              color: "var(--accent)",
              background: "var(--accent-soft)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: 10,
              padding: "8px 10px",
            }}
          >
            {rationale}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

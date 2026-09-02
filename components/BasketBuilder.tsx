"use client";

import { useMemo, useState } from "react";
import type { Address } from "viem";
import type { PricePoint } from "../hooks/useStockPrices";
import { basketValue, formatPrice } from "../lib/pricing";
import { OGB_TOKEN } from "../lib/b20";
import { useCreateBasket } from "../hooks/useCreateBasket";
import { useAccount } from "wagmi";

// Hero: compose a weighted basket, see live value, save it onchain.
export function BasketBuilder({
  points,
  selected,
}: {
  points: PricePoint[];
  selected: string[];
}) {
  const { isConnected } = useAccount();
  const { create, status, error, txHash } = useCreateBasket();
  const [name, setName] = useState("My Basket");
  const [linkOgb, setLinkOgb] = useState(false);
  const chosen = points.filter((p) => selected.includes(p.token.symbol));

  // Equal weights by default, rounded so they sum to 10000.
  const weights = useMemo(() => {
    const n = chosen.length;
    if (n === 0) return [] as number[];
    const base = Math.floor(10000 / n);
    const w = Array(n).fill(base);
    w[n - 1] += 10000 - base * n;
    return w;
  }, [chosen.length]);

  const value = useMemo(() => {
    if (chosen.length === 0) return null;
    if (chosen.some((c) => c.price === null || c.stale)) return null;
    try {
      return basketValue(
        chosen.map((c, i) => ({ price: c.price as bigint, weightBps: weights[i] })),
      );
    } catch {
      return null;
    }
  }, [chosen, weights]);

  async function onSave() {
    await create({
      name,
      tokens: chosen.map((c) => c.token.address as Address),
      weightsBps: weights,
      communityToken: linkOgb ? (OGB_TOKEN as Address) : undefined,
    });
  }

  return (
    <div className="glass" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>Basket builder</h2>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          {chosen.length} selected · equal weight
        </span>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Basket name"
        className="mono"
        style={{
          background: "var(--bg-2)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          color: "var(--text)",
          padding: "10px 12px",
          fontSize: 14,
        }}
      />

      {chosen.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
          Pick stocks above to compose a basket.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {chosen.map((c, i) => (
            <li
              key={c.token.symbol}
              className="mono"
              style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}
            >
              <span>{c.token.symbol}</span>
              <span style={{ color: "var(--muted)" }}>
                {(weights[i] / 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>Basket value (per unit)</span>
        <span className="mono" style={{ fontSize: 18 }}>
          {value === null ? "—" : `$${formatPrice(value)}`}
        </span>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--muted)" }}>
        <input type="checkbox" checked={linkOgb} onChange={(e) => setLinkOgb(e.target.checked)} />
        Link OGB as community token (memestock)
      </label>

      <button
        onClick={onSave}
        disabled={!isConnected || chosen.length === 0 || status === "pending"}
        className={chosen.length > 0 && isConnected ? "accent-glow" : ""}
        style={{
          background: "var(--accent)",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: "12px 16px",
          fontSize: 14,
          fontWeight: 600,
          cursor: chosen.length > 0 && isConnected ? "pointer" : "not-allowed",
          opacity: !isConnected || chosen.length === 0 ? 0.5 : 1,
        }}
      >
        {status === "pending" ? "Saving onchain…" : "Save basket onchain"}
      </button>

      {!isConnected && (
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          Connect your wallet to save. Gas is sponsored.
        </span>
      )}
      {txHash && (
        <span style={{ fontSize: 12, color: "var(--up)" }}>
          Saved · tx {txHash.slice(0, 10)}…
        </span>
      )}
      {error && (
        <span style={{ fontSize: 12, color: "var(--down)" }}>
          {error.message.slice(0, 120)}
        </span>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import type { Address } from "viem";
import type { PricePoint } from "../hooks/useStockPrices";
import { basketValue, formatPrice } from "../lib/pricing";
import { OGB_TOKEN } from "../lib/b20";
import { useCreateBasket } from "../hooks/useCreateBasket";
import { useAccount } from "wagmi";
import { SectionHeader } from "./SectionHeader";
import { BasketIcon } from "./icons";

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
  // OGB (the STAX community token) is auto-included in every basket.
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
      communityToken: OGB_TOKEN as Address, // OGB auto-included on every basket
    });
  }

  return (
    <div className="glass" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionHeader
        icon={<BasketIcon />}
        title="Basket builder"
        meta={`${chosen.length} selected`}
      />

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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 11,
          color: "var(--muted)",
          padding: "8px 10px",
          borderRadius: 10,
          background: "var(--accent-soft)",
          border: "1px solid rgba(34,197,94,0.25)",
        }}
      >
        <span style={{ color: "var(--accent)", fontWeight: 700 }}>+ OGB</span>
        community token auto-included in every basket
      </div>

      <button
        onClick={onSave}
        disabled={!isConnected || chosen.length === 0 || status === "pending"}
        className="btn-glass-accent"
        style={{
          padding: "13px 16px",
          fontSize: 14,
        }}
      >
        {status === "pending" ? "Saving onchain…" : "Save basket onchain"}
      </button>

      {!isConnected && (
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          Connect your wallet to save. Saving costs a small gas fee on Base.
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

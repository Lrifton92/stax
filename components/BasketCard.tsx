"use client";

import type { Address } from "viem";
import type { Basket } from "../hooks/useBaskets";
import { STOCK_TOKENS, OGB_TOKEN } from "../lib/b20";

const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as Address;

// Resolve a token address to a known stock symbol, else a short hex.
function symbolFor(addr: Address): string {
  const t = STOCK_TOKENS.find(
    (s) => s.address.toLowerCase() === addr.toLowerCase(),
  );
  return t ? t.symbol : `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function BasketCard({
  basket,
  selected = false,
  onSelect,
}: {
  basket: Basket;
  selected?: boolean;
  onSelect?: (id: bigint) => void;
}) {
  const hasCommunity =
    basket.communityToken.toLowerCase() !== ZERO_ADDRESS.toLowerCase();
  const isOgb =
    basket.communityToken.toLowerCase() === OGB_TOKEN.toLowerCase();

  return (
    <button
      onClick={onSelect ? () => onSelect(basket.id) : undefined}
      className={`glass${selected ? " accent-glow" : ""}`}
      style={{
        textAlign: "left",
        padding: 16,
        cursor: onSelect ? "pointer" : "default",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 15 }}>{basket.name}</span>
        {hasCommunity && (
          <span
            title="Community / memestock token linked to this basket"
            className="mono"
            style={{
              fontSize: 10,
              padding: "2px 7px",
              borderRadius: 999,
              color: "var(--accent)",
              border: "1px solid var(--accent)",
              background: "var(--accent-soft)",
            }}
          >
            {isOgb ? "OGB" : "COMMUNITY"}
          </span>
        )}
      </div>

      <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
        #{basket.id.toString()} · {basket.tokens.length} token
        {basket.tokens.length === 1 ? "" : "s"}
      </span>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        {basket.tokens.map((addr, i) => (
          <li
            key={`${addr}-${i}`}
            className="mono"
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
            }}
          >
            <span>{symbolFor(addr)}</span>
            <span style={{ color: "var(--muted)" }}>
              {((basket.weightsBps[i] ?? 0) / 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </button>
  );
}

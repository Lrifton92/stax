"use client";

import type { Address } from "viem";
import type { Basket } from "../hooks/useBaskets";
import type { PricePoint } from "../hooks/useStockPrices";
import { STOCK_TOKENS, OGB_TOKEN } from "../lib/b20";
import { basketValue, formatPrice } from "../lib/pricing";
import { TokenLogo, symbolForAddress } from "./TokenLogo";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

function symbolFor(addr: Address): string {
  return symbolForAddress(addr) ?? `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function BasketCard({
  basket,
  points,
  selected = false,
  onSelect,
}: {
  basket: Basket;
  points?: PricePoint[];
  selected?: boolean;
  onSelect?: (id: bigint) => void;
}) {
  const isOgb =
    basket.communityToken.toLowerCase() === OGB_TOKEN.toLowerCase();
  const hasCommunity =
    basket.communityToken.toLowerCase() !== ZERO_ADDRESS.toLowerCase();

  // live per-unit value from current prices, when all legs are priced & fresh
  let value: bigint | null = null;
  if (points && basket.tokens.length > 0) {
    const priceBy = new Map(
      points.map((p) => [p.token.address.toLowerCase(), p]),
    );
    const holdings = basket.tokens.map((addr, i) => {
      const pt = priceBy.get(addr.toLowerCase());
      return {
        price: pt && !pt.stale ? pt.price : null,
        weightBps: basket.weightsBps[i] ?? 0,
      };
    });
    if (holdings.every((h) => h.price !== null)) {
      try {
        value = basketValue(
          holdings.map((h) => ({ price: h.price as bigint, weightBps: h.weightBps })),
        );
      } catch {
        value = null;
      }
    }
  }

  const symbols = STOCK_TOKENS.filter((s) =>
    basket.tokens.some((a) => a.toLowerCase() === s.address.toLowerCase()),
  ).map((s) => s.symbol);

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
        gap: 12,
        width: "100%",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>{basket.name}</span>
        {hasCommunity && (
          <span
            className="mono"
            title="Community / memestock token linked to this basket"
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

      {/* logo stack */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {symbols.slice(0, 6).map((sym, i) => (
          <span key={sym} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i }}>
            <TokenLogo symbol={sym} size={26} />
          </span>
        ))}
        {basket.tokens.length > 6 && (
          <span className="mono" style={{ marginLeft: 8, fontSize: 11, color: "var(--muted)" }}>
            +{basket.tokens.length - 6}
          </span>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
        <span className="mono" style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--fg-3)" }}>
          #{basket.id.toString()} · {basket.tokens.length} token{basket.tokens.length === 1 ? "" : "s"}
        </span>
        <span className="kore-money" style={{ fontSize: 17 }}>
          {value === null ? "—" : `$${formatPrice(value)}`}
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {basket.tokens.map((addr, i) => (
          <span
            key={`${addr}-${i}`}
            className="mono"
            style={{
              fontSize: 10.5,
              padding: "2px 7px",
              borderRadius: 6,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border)",
              color: "var(--fg-2)",
            }}
          >
            {symbolFor(addr)} {((basket.weightsBps[i] ?? 0) / 100).toFixed(0)}%
          </span>
        ))}
      </div>
    </button>
  );
}

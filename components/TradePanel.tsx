"use client";

import { useMemo, useState } from "react";
import type { Address } from "viem";
import type { Basket } from "../hooks/useBaskets";
import type { PricePoint } from "../hooks/useStockPrices";
import { STOCK_TOKENS, OGB_TOKEN } from "../lib/b20";
import { formatPrice } from "../lib/pricing";
import { TokenLogo } from "./TokenLogo";
import { SectionHeader } from "./SectionHeader";
import { MarketsIcon } from "./icons";

// Explorer + official venue links. B20 tokenized stocks are compliance-gated
// (isAuthorized policy) and not on DEXs, so we don't fake an in-app swap —
// we hand off to the compliant venue and let anyone verify the asset on-chain.
const BLOCKSCOUT = "https://base.blockscout.com/token/";
const HOW_TO_TRADE =
  "https://docs.base.org/base-chain/asset-issuance/tokenized-stocks-on-base";

type Opt = { address: Address; symbol: string; name: string; open: boolean };

function LinkButton({
  href,
  children,
  accent,
}: {
  href: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={accent ? "btn-glass-accent" : "btn-glass"}
      style={{
        textAlign: "center",
        padding: "11px 14px",
        fontSize: 13,
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
}

export function TradePanel({
  basket,
  points,
}: {
  basket?: Basket | null;
  points?: PricePoint[];
}) {
  const options = useMemo<Opt[]>(() => {
    const stocks: Opt[] = STOCK_TOKENS.map((t) => ({
      address: t.address,
      symbol: t.symbol,
      name: t.name,
      open: false,
    }));
    const ogb: Opt = {
      address: OGB_TOKEN,
      symbol: "OGB",
      name: "STAX community token",
      open: true,
    };
    if (basket && basket.tokens.length > 0) {
      const inBasket = stocks.filter((s) =>
        basket.tokens.some((a) => a.toLowerCase() === s.address.toLowerCase()),
      );
      return [...inBasket, ogb];
    }
    return [...stocks, ogb];
  }, [basket]);

  const [addr, setAddr] = useState<Address | "">("");
  const chosen = options.find((o) => o.address === addr) ?? options[0];

  const price = points?.find(
    (p) => p.token.address.toLowerCase() === chosen?.address.toLowerCase(),
  );

  if (!chosen) return null;

  return (
    <div
      className="glass"
      style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}
    >
      <SectionHeader icon={<MarketsIcon />} title="Trade" meta="via Coinbase" />

      <select
        value={chosen.address}
        onChange={(e) => setAddr(e.target.value as Address)}
        className="mono"
        style={{
          background: "var(--bg-2)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          color: "var(--text)",
          padding: "10px 12px",
          fontSize: 13,
        }}
      >
        {options.map((o) => (
          <option key={o.address} value={o.address}>
            {o.symbol} · {o.name}
          </option>
        ))}
      </select>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 10,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--border)",
        }}
      >
        <TokenLogo symbol={chosen.symbol} size={28} />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>
            {chosen.symbol}
          </span>
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: chosen.open ? "var(--accent)" : "var(--fg-3)",
            }}
          >
            {chosen.open ? "Open to all" : "Eligible accounts"}
          </span>
        </div>
        <span className="kore-money" style={{ marginLeft: "auto", fontSize: 17 }}>
          {price && price.price !== null ? `$${formatPrice(price.price)}` : "—"}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <LinkButton
          accent
          href={
            chosen.open ? `${BLOCKSCOUT}${chosen.address}` : HOW_TO_TRADE
          }
        >
          {chosen.open ? "Trade OGB on Base" : "How to trade (eligible)"}
        </LinkButton>
        <LinkButton href={`${BLOCKSCOUT}${chosen.address}`}>
          Verify asset on-chain ↗
        </LinkButton>
      </div>

      <p style={{ margin: 0, fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
        Tokenized stocks settle on Base and trade in compliance-eligible venues.
        Saving baskets and alerts is on-chain and open to any wallet.
      </p>
    </div>
  );
}

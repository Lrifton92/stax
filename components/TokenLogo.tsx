"use client";

import { useState } from "react";
import type { Address } from "viem";
import { STOCK_TOKENS } from "../lib/b20";

// ticker (without trailing "c") -> company domain for the favicon logo
export const DOMAINS: Record<string, string> = {
  AAPL: "apple.com",
  AMZN: "amazon.com",
  COIN: "coinbase.com",
  CRCL: "circle.com",
  GOOGL: "google.com",
  INTC: "intel.com",
  META: "meta.com",
  MSFT: "microsoft.com",
  MSTR: "strategy.com",
  NVDA: "nvidia.com",
  SNDK: "sandisk.com",
  SPCX: "spacex.com",
  TSLA: "tesla.com",
};

export function symbolForAddress(addr: Address): string | null {
  const t = STOCK_TOKENS.find(
    (s) => s.address.toLowerCase() === addr.toLowerCase(),
  );
  return t ? t.symbol : null;
}

export function TokenLogo({
  symbol,
  size = 34,
}: {
  symbol: string;
  size?: number;
}) {
  const ticker = symbol.replace(/c$/, "");
  const domain = DOMAINS[ticker];
  const [failed, setFailed] = useState(!domain);
  const radius = Math.round(size * 0.3);
  const box: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: radius,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    overflow: "hidden",
  };
  if (failed) {
    return (
      <div style={box}>
        <span
          className="mono"
          style={{ fontSize: size * 0.34, fontWeight: 700, color: "var(--fg-2)" }}
        >
          {ticker.slice(0, 2)}
        </span>
      </div>
    );
  }
  const img = Math.round(size * 0.64);
  return (
    <div style={box}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
        alt={ticker}
        width={img}
        height={img}
        style={{ width: img, height: img, objectFit: "contain" }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { WalletButton } from "./WalletButton";

// STAX shell — Kore terminal chrome: pure-black window, thin 1px ring,
// blurred titlebar, live status-line footer, JetBrains Mono throughout.
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", padding: 10 }}>
      <div
        style={{
          width: "100%",
          margin: 0,
          borderRadius: 16,
          overflow: "hidden",
          background: "rgba(0,0,0,0.4)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.06), 0 30px 80px -40px rgba(0,0,0,0.9)",
        }}
      >
        {/* titlebar */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "13px 18px",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(20px) saturate(140%)",
            WebkitBackdropFilter: "blur(20px) saturate(140%)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "0.28em",
                paddingLeft: 2,
              }}
            >
              STAX
            </span>
            <span
              style={{
                fontSize: 9.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--fg-3)",
              }}
            >
              Tokenized Stock Baskets · Base
            </span>
          </div>
          <WalletButton />
        </header>

        {/* body */}
        <main style={{ padding: "26px 22px 24px" }}>{children}</main>

        {/* status-line */}
        <div className="kore-statusline">
          <span className="kore-live">LIVE</span>
          <span className="sep">·</span>
          <span>BASE MAINNET</span>
          <span className="sep">·</span>
          <span>CHAINLINK · 8DP</span>
          <span className="sep">·</span>
          <span>13 FEEDS</span>
          <span style={{ marginLeft: "auto", color: "var(--fg-3)" }}>
            B20 · STAX
          </span>
        </div>
      </div>
    </div>
  );
}

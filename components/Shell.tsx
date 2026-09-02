"use client";

import type { ReactNode } from "react";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Avatar, Name, Identity, Address } from "@coinbase/onchainkit/identity";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          backdropFilter: "blur(10px)",
          background: "rgba(10,11,13,0.6)",
          zIndex: 5,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span
            className="mono"
            style={{ fontSize: 20, fontWeight: 600, letterSpacing: 1 }}
          >
            STAX
          </span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            tokenized stock baskets · Base
          </span>
        </div>
        <Wallet>
          <ConnectWallet>
            <Avatar className="h-6 w-6" />
            <Name />
          </ConnectWallet>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </header>
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "24px 20px 80px",
        }}
      >
        {children}
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

// Custom Apple-glass wallet control. Lets the user pick an injected wallet
// (MetaMask / Rabby) instead of being forced into the Coinbase Smart Wallet popup.
export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, status } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);

  if (isConnected && address) {
    return (
      <div style={{ position: "relative" }}>
        <button
          className="btn-glass"
          onClick={() => setOpen((v) => !v)}
          style={{ padding: "9px 14px", fontSize: 12 }}
        >
          <span style={{ color: "var(--accent)" }}>●</span>&nbsp;{short(address)}
        </button>
        {open && (
          <div
            className="glass"
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              padding: 8,
              minWidth: 160,
              zIndex: 50,
            }}
          >
            <button
              className="btn-glass"
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
              style={{ width: "100%", padding: "9px 12px", fontSize: 12 }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  // de-dupe connectors by name (wagmi can list the same wallet twice)
  const seen = new Set<string>();
  const list = connectors.filter((c) => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });

  return (
    <div style={{ position: "relative" }}>
      <button
        className="btn-glass"
        onClick={() => setOpen((v) => !v)}
        style={{ padding: "9px 16px", fontSize: 12.5 }}
      >
        {status === "pending" ? "Connecting…" : "Connect Wallet"}
      </button>
      {open && (
        <div
          className="glass"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            padding: 8,
            minWidth: 210,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            zIndex: 50,
          }}
        >
          {list.map((c) => (
            <button
              key={c.uid}
              className="btn-glass"
              onClick={() => {
                connect({ connector: c });
                setOpen(false);
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 12.5,
                textAlign: "left",
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

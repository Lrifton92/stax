"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

// Custom Apple-glass wallet control. The menu is portaled to <body> with fixed
// positioning so it can't be clipped by the shell's overflow:hidden. Lets the
// user pick an injected wallet (MetaMask / Rabby) instead of the Coinbase popup.
export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, status } = useConnect();
  const { disconnect } = useDisconnect();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggle = useCallback(() => {
    setOpen((v) => {
      const next = !v;
      if (next && btnRef.current) {
        const r = btnRef.current.getBoundingClientRect();
        setPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
      }
      return next;
    });
  }, []);

  // close on outside click / escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // de-dupe connectors by name
  const seen = new Set<string>();
  const list = connectors.filter((c) => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });

  const menu =
    open && pos && mounted
      ? createPortal(
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="glass"
            style={{
              position: "fixed",
              top: pos.top,
              right: pos.right,
              padding: 8,
              minWidth: 210,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              zIndex: 1000,
            }}
          >
            {isConnected ? (
              <button
                className="btn-glass"
                onClick={() => {
                  disconnect();
                  setOpen(false);
                }}
                style={{ width: "100%", padding: "10px 12px", fontSize: 12.5 }}
              >
                Disconnect
              </button>
            ) : (
              list.map((c) => (
                <button
                  key={c.uid}
                  className="btn-glass"
                  onClick={() => {
                    connect({ connector: c });
                    setOpen(false);
                  }}
                  style={{ width: "100%", padding: "10px 12px", fontSize: 12.5, textAlign: "left" }}
                >
                  {c.name}
                </button>
              ))
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={btnRef}
        className="btn-glass"
        onClick={toggle}
        style={{ padding: "9px 16px", fontSize: 12.5 }}
      >
        {isConnected && address ? (
          <>
            <span style={{ color: "var(--accent)" }}>●</span>&nbsp;{short(address)}
          </>
        ) : status === "pending" ? (
          "Connecting…"
        ) : (
          "Connect Wallet"
        )}
      </button>
      {menu}
    </>
  );
}

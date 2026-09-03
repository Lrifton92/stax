"use client";

import { useMemo, useState } from "react";
import type { Address } from "viem";
import type { Basket } from "../hooks/useBaskets";
import { STOCK_TOKENS } from "../lib/b20";
import { useSetAlert, type AlertDirection } from "../hooks/useSetAlert";
import { SectionHeader } from "./SectionHeader";
import { BellIcon } from "./icons";

const fieldStyle: React.CSSProperties = {
  background: "var(--bg-2)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  color: "var(--text)",
  padding: "10px 12px",
  fontSize: 14,
};

function labelFor(addr: Address): string {
  const t = STOCK_TOKENS.find(
    (s) => s.address.toLowerCase() === addr.toLowerCase(),
  );
  return t ? `${t.symbol} · ${t.name}` : `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

// Set a price alert on a token inside a saved basket. Needs a basketId, so it's
// only usable once at least one basket exists.
export function AlertForm({ basket }: { basket?: Basket | null }) {
  const { setAlert, status, error } = useSetAlert();

  // Token options come from the selected basket; fall back to the full stock
  // list when the basket carries no tokens.
  const options = useMemo<{ address: Address; label: string }[]>(() => {
    if (basket && basket.tokens.length > 0) {
      return basket.tokens.map((a) => ({ address: a, label: labelFor(a) }));
    }
    return STOCK_TOKENS.map((s) => ({ address: s.address, label: labelFor(s.address) }));
  }, [basket]);

  const [token, setToken] = useState<Address | "">("");
  const [thresholdUsd, setThresholdUsd] = useState("");
  const [direction, setDirection] = useState<AlertDirection>(0);
  const [done, setDone] = useState(false);

  if (!basket) {
    return (
      <div className="glass" style={{ padding: 18 }}>
        <SectionHeader icon={<BellIcon />} title="Price alerts" />
        <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
          Save a basket first, then select it to set a price alert on one of its
          tokens.
        </p>
      </div>
    );
  }

  const chosenToken = (token || options[0]?.address) as Address | undefined;
  const usd = Number.parseFloat(thresholdUsd);
  const valid =
    !!chosenToken && Number.isFinite(usd) && usd > 0 && status !== "pending";

  async function onSubmit() {
    if (!chosenToken || !Number.isFinite(usd) || usd <= 0 || !basket) return;
    const threshold8dec = BigInt(Math.round(usd * 1e8));
    setDone(false);
    await setAlert(basket.id, chosenToken, threshold8dec, direction);
    setDone(true);
  }

  return (
    <div
      className="glass"
      style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}
    >
      <SectionHeader
        icon={<BellIcon />}
        title="Price alerts"
        meta={`${basket.name} · #${basket.id.toString()}`}
      />

      <label style={{ fontSize: 12, color: "var(--muted)" }}>Token</label>
      <select
        value={chosenToken ?? ""}
        onChange={(e) => setToken(e.target.value as Address)}
        style={fieldStyle}
      >
        {options.map((o) => (
          <option key={o.address} value={o.address}>
            {o.label}
          </option>
        ))}
      </select>

      <label style={{ fontSize: 12, color: "var(--muted)" }}>
        Threshold (USD)
      </label>
      <input
        value={thresholdUsd}
        onChange={(e) => setThresholdUsd(e.target.value)}
        inputMode="decimal"
        placeholder="e.g. 225.00"
        className="mono"
        style={fieldStyle}
      />

      <div style={{ display: "flex", gap: 8 }}>
        {([
          [0, "Below"],
          [1, "Above"],
        ] as [AlertDirection, string][]).map(([d, lbl]) => (
          <button
            key={d}
            onClick={() => setDirection(d)}
            style={{
              flex: 1,
              background: direction === d ? "var(--accent-soft)" : "var(--bg-2)",
              border: `1px solid ${direction === d ? "var(--accent)" : "var(--border)"}`,
              color: direction === d ? "var(--accent)" : "var(--muted)",
              borderRadius: 10,
              padding: "9px 12px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {lbl}
          </button>
        ))}
      </div>

      <button
        onClick={onSubmit}
        disabled={!valid}
        className="btn-glass-accent"
        style={{ padding: "13px 16px", fontSize: 14 }}
      >
        {status === "pending" ? "Setting alert…" : "Set alert"}
      </button>

      {done && status !== "pending" && !error && (
        <span style={{ fontSize: 12, color: "var(--up)" }}>Alert set onchain.</span>
      )}
      {error && (
        <span style={{ fontSize: 12, color: "var(--down)" }}>
          {error.message.slice(0, 120)}
        </span>
      )}
    </div>
  );
}

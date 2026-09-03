"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export type Tab = { key: string; label: string; icon: ReactNode };

// App-style segmented control with an animated active pill (shared layoutId).
export function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div
      role="tablist"
      className="glass"
      style={{
        display: "inline-flex",
        gap: 4,
        padding: 4,
        borderRadius: 14,
      }}
    >
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.key)}
            className="mono"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 16px",
              borderRadius: 10,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 12.5,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: on ? "var(--accent)" : "var(--fg-3)",
              transition: "color 0.2s ease",
            }}
          >
            {on && (
              <motion.span
                layoutId="tab-pill"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 10,
                  background: "var(--accent-soft)",
                  border: "1px solid rgba(34,197,94,0.35)",
                }}
              />
            )}
            <span style={{ position: "relative", display: "inline-flex" }}>
              {t.icon}
            </span>
            <span style={{ position: "relative" }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { formatPrice } from "../lib/pricing";

// Animated price with a subtle color flash on change. Respects reduced-motion.
export function PriceTicker({
  price,
  stale,
}: {
  price: bigint | null;
  stale: boolean;
}) {
  const reduce = useReducedMotion();
  const prev = useRef<bigint | null>(null);
  const [dir, setDir] = useState<"up" | "down" | "flat">("flat");

  useEffect(() => {
    if (price === null || prev.current === null) {
      prev.current = price;
      return;
    }
    if (price > prev.current) setDir("up");
    else if (price < prev.current) setDir("down");
    prev.current = price;
    const t = setTimeout(() => setDir("flat"), 700);
    return () => clearTimeout(t);
  }, [price]);

  if (price === null) {
    return <span className="kore-money" style={{ color: "var(--muted)" }}>—</span>;
  }

  const color =
    dir === "up" ? "var(--up)" : dir === "down" ? "var(--down)" : "var(--text)";

  return (
    <span className="kore-money" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 15 }}>
      <motion.span
        key={price.toString()}
        initial={reduce ? false : { opacity: 0.4, y: dir === "up" ? 6 : dir === "down" ? -6 : 0 }}
        animate={{ opacity: 1, y: 0, color }}
        transition={{ duration: 0.35 }}
      >
        ${formatPrice(price)}
      </motion.span>
      {stale && (
        <span
          title="Feed stale — price may be outdated"
          style={{
            fontSize: 10,
            padding: "1px 5px",
            borderRadius: 6,
            color: "var(--down)",
            border: "1px solid var(--down)",
            opacity: 0.8,
          }}
        >
          STALE
        </span>
      )}
    </span>
  );
}

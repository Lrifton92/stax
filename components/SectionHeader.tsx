"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

// Section header: accent icon chip + title + optional meta, with an animated
// underline that draws in from the left (animate-text "line reveal").
export function SectionHeader({
  icon,
  title,
  meta,
}: {
  icon: ReactNode;
  title: string;
  meta?: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <div style={{ marginBottom: 16 }}>
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingBottom: 12,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 9,
            color: "var(--accent)",
            background: "var(--accent-soft)",
            border: "1px solid rgba(34,197,94,0.28)",
          }}
        >
          {icon}
        </span>
        <h2
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </h2>
        {meta ? (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--fg-3)",
            }}
          >
            {meta}
          </span>
        ) : null}
      </motion.div>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          transformOrigin: "left",
          height: 1,
          background: "var(--border)",
        }}
      />
    </div>
  );
}

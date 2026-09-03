"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";

// Word-by-word blur-in reveal (animate-text "soft blur in" + "stagger").
// Trailing punctuation (. , ! ?) is split out and rendered in the accent color
// with a spring "pop", so the punctuation animates distinctly.
export function AnimatedWords({
  text,
  style,
  delay = 0,
  as = "h1",
}: {
  text: string;
  style?: CSSProperties;
  delay?: number;
  as?: "h1" | "h2" | "span";
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const MotionTag = as === "h1" ? motion.h1 : as === "h2" ? motion.h2 : motion.span;

  return (
    <MotionTag
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: reduce ? 0 : 0.06, delayChildren: delay },
        },
      }}
      style={{ margin: 0, ...style }}
    >
      {words.map((w, i) => {
        const m = w.match(/^(.*?)([.,!?]+)$/);
        const core = m ? m[1] : w;
        const punct = m ? m[2] : "";
        return (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre" }}>
            <motion.span
              style={{ display: "inline-block" }}
              variants={{
                hidden: reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: "0.4em", filter: "blur(8px)" },
                show: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              {core}
            </motion.span>
            {punct && (
              <motion.span
                style={{ display: "inline-block", color: "var(--accent)" }}
                variants={{
                  hidden: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.3 },
                  show: {
                    opacity: 1,
                    scale: 1,
                    transition: reduce
                      ? { duration: 0.01 }
                      : { type: "spring", stiffness: 520, damping: 16, delay: 0.12 },
                  },
                }}
              >
                {punct}
              </motion.span>
            )}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </MotionTag>
  );
}

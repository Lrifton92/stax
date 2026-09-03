import type { ReactNode } from "react";

// Consistent section header: accent icon chip + title + optional right-side meta.
export function SectionHeader({
  icon,
  title,
  meta,
}: {
  icon: ReactNode;
  title: string;
  meta?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: "1px solid var(--border)",
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
    </div>
  );
}

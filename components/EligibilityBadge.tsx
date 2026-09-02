"use client";

// Stock tokens are compliance-gated (isAuthorized(policyID, account)). The
// policyID isn't known client-side, so we can't reliably read eligibility here.
// Save + alerts always work; only trading is gated. Show the honest muted state.
export function EligibilityBadge() {
  return (
    <span
      title="Saving baskets and price alerts work for any wallet. On-chain trading of the underlying tokenized stocks is restricted to compliance-eligible accounts."
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        color: "var(--muted)",
        border: "1px solid var(--border)",
        borderRadius: 999,
        padding: "4px 10px",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: "var(--muted)",
        }}
      />
      Save &amp; alerts enabled · trading gated
    </span>
  );
}

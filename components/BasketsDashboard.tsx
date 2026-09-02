"use client";

import type { Address } from "viem";
import { useBaskets } from "../hooks/useBaskets";
import { getRegistryAddress } from "../lib/registry";
import { BasketCard } from "./BasketCard";

const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as Address;

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="glass"
      style={{
        padding: 22,
        color: "var(--muted)",
        fontSize: 13,
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}

export function BasketsDashboard({
  address,
  selectedId,
  onSelect,
}: {
  address?: Address;
  selectedId?: bigint | null;
  onSelect?: (id: bigint) => void;
}) {
  const registryDeployed = getRegistryAddress() !== ZERO_ADDRESS;
  const { baskets, isLoading } = useBaskets(address);

  if (!registryDeployed) {
    return <Empty>Registry not deployed yet</Empty>;
  }
  if (!address) {
    return <Empty>Connect your wallet to see your saved baskets.</Empty>;
  }
  if (isLoading) {
    return <Empty>Loading your baskets…</Empty>;
  }
  if (baskets.length === 0) {
    return <Empty>No baskets yet — build one above.</Empty>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 12,
      }}
    >
      {baskets.map((b) => (
        <BasketCard
          key={b.id.toString()}
          basket={b}
          selected={selectedId != null && b.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

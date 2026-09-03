"use client";

import { useReadContract, useReadContracts } from "wagmi";
import type { Address } from "viem";
import { REGISTRY_ABI, getRegistryAddress } from "../lib/registry";

const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as Address;

export type Basket = {
  id: bigint;
  name: string;
  tokens: readonly Address[];
  weightsBps: readonly number[];
  communityToken: Address;
};

// getBasket returns this tuple; we only surface the fields the UI needs.
type BasketStruct = {
  owner: Address;
  name: string;
  tokens: readonly Address[];
  weightsBps: readonly number[];
  communityToken: Address;
  createdAt: bigint;
  updatedAt: bigint;
};

// Reads basketsOf(address) then getBasket(id) for each. Guards against an
// undeployed registry (address 0x000…0) and a missing wallet by returning [].
export function useBaskets(address?: Address) {
  const registry = getRegistryAddress();
  const deployed = registry !== ZERO_ADDRESS;
  const enabled = deployed && !!address;

  const idsQuery = useReadContract({
    address: registry,
    abi: REGISTRY_ABI,
    functionName: "basketsOf",
    args: address ? [address] : undefined,
    // Poll so a freshly-saved basket appears within a few seconds without a
    // manual page refresh (the save tx mines in ~2s on Base).
    query: { enabled, refetchInterval: 5000, refetchOnMount: "always" },
  });

  const ids = (idsQuery.data as readonly bigint[] | undefined) ?? [];

  const basketsQuery = useReadContracts({
    contracts: ids.map((id) => ({
      address: registry,
      abi: REGISTRY_ABI,
      functionName: "getBasket",
      args: [id],
    })),
    query: { enabled: enabled && ids.length > 0, refetchOnMount: "always" },
  });

  const baskets: Basket[] = [];
  if (deployed) {
    ids.forEach((id, i) => {
      const r = basketsQuery.data?.[i];
      if (r && r.status === "success") {
        const b = r.result as unknown as BasketStruct;
        baskets.push({
          id,
          name: b.name,
          tokens: b.tokens,
          weightsBps: b.weightsBps,
          communityToken: b.communityToken,
        });
      }
    });
  }

  const isLoading =
    enabled &&
    (idsQuery.isLoading || (ids.length > 0 && basketsQuery.isLoading));

  async function refetch() {
    await idsQuery.refetch();
    if (ids.length > 0) await basketsQuery.refetch();
  }

  return { baskets, isLoading, refetch };
}

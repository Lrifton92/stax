"use client";

import { useWriteContract } from "wagmi";
import type { Address } from "viem";
import { REGISTRY_ABI, getRegistryAddress } from "../lib/registry";

export type BasketInput = {
  name: string;
  tokens: Address[];
  weightsBps: number[]; // must sum to 10000
  communityToken?: Address;
};

// Prepares and sends a createBasket tx. The wallet (0x1dee or any) signs.
// Paymaster (configured on the provider) sponsors gas so the user pays nothing.
export function useCreateBasket() {
  const { writeContractAsync, status, error, data } = useWriteContract();

  async function create(input: BasketInput) {
    const total = input.weightsBps.reduce((s, w) => s + w, 0);
    if (total !== 10000) throw new Error(`weights must sum to 10000, got ${total}`);
    return writeContractAsync({
      address: getRegistryAddress(),
      abi: REGISTRY_ABI,
      functionName: "createBasket",
      args: [
        input.name,
        input.tokens,
        input.weightsBps.map((w) => w),
        (input.communityToken ??
          "0x0000000000000000000000000000000000000000") as Address,
      ],
    });
  }

  return { create, status, error, txHash: data };
}

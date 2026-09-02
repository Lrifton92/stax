"use client";

import { useWriteContract } from "wagmi";
import type { Address } from "viem";
import { REGISTRY_ABI, getRegistryAddress } from "../lib/registry";

// direction matches BasketRegistry: 0 = below threshold, 1 = above threshold (uint8 onchain).
export type AlertDirection = 0 | 1;

// Sends a setAlert(uint256,address,int256,uint8) tx. Threshold is an 8-decimal
// price integer (same scale as the Chainlink feeds). Gas is sponsored.
export function useSetAlert() {
  const { writeContractAsync, status, error } = useWriteContract();

  async function setAlert(
    id: bigint,
    token: Address,
    threshold8dec: bigint,
    direction: AlertDirection,
  ) {
    return writeContractAsync({
      address: getRegistryAddress(),
      abi: REGISTRY_ABI,
      functionName: "setAlert",
      args: [id, token, threshold8dec, direction],
    });
  }

  return { setAlert, status, error };
}

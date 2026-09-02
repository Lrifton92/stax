// BasketRegistry ABI + address + typed helpers.
import type { Address } from "viem";

export function getRegistryAddress(): Address {
  const a = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as Address | undefined;
  // Filled after Soufian deploys via base-forge (script/DeployBasketRegistry.s.sol).
  return (a ?? "0x0000000000000000000000000000000000000000") as Address;
}

export const REGISTRY_ABI = [
  {
    type: "function",
    name: "createBasket",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "tokens", type: "address[]" },
      { name: "weightsBps", type: "uint16[]" },
      { name: "communityToken", type: "address" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    type: "function",
    name: "updateBasket",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "tokens", type: "address[]" },
      { name: "weightsBps", type: "uint16[]" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "deleteBasket",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setAlert",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "token", type: "address" },
      { name: "threshold", type: "int256" },
      { name: "direction", type: "uint8" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "linkCommunityToken",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "token", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getBasket",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "owner", type: "address" },
          { name: "name", type: "string" },
          { name: "tokens", type: "address[]" },
          { name: "weightsBps", type: "uint16[]" },
          { name: "communityToken", type: "address" },
          { name: "createdAt", type: "uint64" },
          { name: "updatedAt", type: "uint64" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "basketsOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
] as const;

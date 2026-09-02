// B20 tokenized-stock reads: registry, token list, multiplier math.
// B20 tokens are Base-native precompiles (Beryl upgrade). One B20 token does NOT
// permanently equal one share — always apply the current multiplier when converting.
import type { Address, PublicClient } from "viem";

export const B20_REGISTRY: Address =
  "0x3f3E8cf41cdd3b1D118c16471aB0113DfDDd5CaD";

// Soufian's own B20 (community token, NOT a gated stock) — usable by 0x1dee.
export const OGB_TOKEN: Address =
  "0xb200000000000000000000026aFdac7C1D621b78";

export type StockToken = {
  symbol: string; // e.g. "AAPLc"
  name: string; // e.g. "Coinbase AAPL"
  address: Address; // B20 precompile
  feed: Address; // Chainlink V3 aggregator proxy
  heartbeatSec: number; // staleness bound
};

// Seed list — verified from Base docs. The full 14-token set + feeds is
// enumerated at build time via scripts/fetch-tokens.ts (B20Created events + docs).
export const STOCK_TOKENS: StockToken[] = [
  {
    symbol: "AAPLc",
    name: "Coinbase AAPL",
    address: "0xb200000000000000000000C2e324d24d7eEcd1fb",
    feed: "0x787f13dEa48Db0897CbCDD985de77809D837F988",
    heartbeatSec: 86400,
  },
  {
    symbol: "MSFTc",
    name: "Coinbase MSFT",
    address: "0xb200000000000000000000000000000000000000", // placeholder until fetch-tokens
    feed: "0xeB10A6c9aa7E537aEd766C08c35Dae35B321b18c",
    heartbeatSec: 86400,
  },
  {
    symbol: "AMZNc",
    name: "Coinbase AMZN",
    address: "0xb200000000000000000000d9192b6B456483C2E8",
    feed: "0x0000000000000000000000000000000000000000", // fetch-tokens fills feed
    heartbeatSec: 86400,
  },
];

export const MULTIPLIER_SCALE = 10n ** 18n; // multiplier is 1e18-scaled

// raw token units -> underlying-share-equivalent (scaled) balance
export function toScaledBalance(raw: bigint, multiplier: bigint): bigint {
  return (raw * multiplier) / MULTIPLIER_SCALE;
}

// scaled (share-equivalent) -> raw token units
export function toRawBalance(scaled: bigint, multiplier: bigint): bigint {
  if (multiplier === 0n) throw new Error("multiplier is zero");
  return (scaled * MULTIPLIER_SCALE) / multiplier;
}

const REGISTRY_ABI = [
  {
    type: "function",
    name: "getMultiplier",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "isPaused",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export async function getMultiplier(
  client: PublicClient,
  token: Address,
): Promise<bigint> {
  return client.readContract({
    address: B20_REGISTRY,
    abi: REGISTRY_ABI,
    functionName: "getMultiplier",
    args: [token],
  }) as Promise<bigint>;
}

export async function isPaused(
  client: PublicClient,
  token: Address,
): Promise<boolean> {
  return client.readContract({
    address: B20_REGISTRY,
    abi: REGISTRY_ABI,
    functionName: "isPaused",
    args: [token],
  }) as Promise<boolean>;
}

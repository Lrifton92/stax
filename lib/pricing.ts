// Chainlink pricing for tokenized stocks. All feeds return 8 decimals, total-return
// (multiplier-adjusted at the feed). ALWAYS check staleness before relying on a price.
import type { Address, PublicClient } from "viem";

export const PRICE_DECIMALS = 8;

const AGGREGATOR_V3_ABI = [
  {
    type: "function",
    name: "latestRoundData",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
  },
] as const;

export type FeedRead = { price: bigint; updatedAt: bigint };

export async function readFeed(
  client: PublicClient,
  feed: Address,
): Promise<FeedRead> {
  const [, answer, , updatedAt] = (await client.readContract({
    address: feed,
    abi: AGGREGATOR_V3_ABI,
    functionName: "latestRoundData",
  })) as [bigint, bigint, bigint, bigint, bigint];
  return { price: answer, updatedAt };
}

// A feed is stale when the last update is older than its heartbeat bound.
export function isStale(
  updatedAt: bigint,
  heartbeatSec: number,
  nowSec: number,
): boolean {
  if (updatedAt === 0n) return true;
  return BigInt(nowSec) - updatedAt > BigInt(heartbeatSec);
}

// Chainlink stock feeds are already total-return (multiplier-adjusted), so the
// feed answer IS the token price. This wrapper exists for feeds that are NOT
// multiplier-adjusted: pass multiplier=1e18 for total-return feeds.
export function tokenPrice(feedPrice: bigint, multiplier1e18: bigint): bigint {
  return (feedPrice * multiplier1e18) / 10n ** 18n;
}

export type Holding = { price: bigint; weightBps: number };

// Weighted basket value per 1 unit of notional, in 8-decimal price units.
// weightsBps must sum to 10000.
export function basketValue(holdings: Holding[]): bigint {
  const total = holdings.reduce((s, h) => s + h.weightBps, 0);
  if (total !== 10000) {
    throw new Error(`weights must sum to 10000, got ${total}`);
  }
  return holdings.reduce(
    (acc, h) => acc + (h.price * BigInt(h.weightBps)) / 10000n,
    0n,
  );
}

// human-readable formatter (8-decimal fixed -> string with 2 dp)
export function formatPrice(price8: bigint): string {
  const neg = price8 < 0n;
  const v = neg ? -price8 : price8;
  const whole = v / 10n ** 8n;
  const cents = (v % 10n ** 8n) / 10n ** 6n; // 2 dp
  return `${neg ? "-" : ""}${whole}.${cents.toString().padStart(2, "0")}`;
}

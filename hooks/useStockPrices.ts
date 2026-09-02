"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { STOCK_TOKENS, type StockToken } from "../lib/b20";
import { readFeed, isStale } from "../lib/pricing";

export type PricePoint = {
  token: StockToken;
  price: bigint | null;
  stale: boolean;
  error?: boolean;
};

// Reads all stock feeds and flags staleness. Refreshes on an interval.
export function useStockPrices(intervalMs = 30_000): PricePoint[] {
  const client = usePublicClient();
  const [points, setPoints] = useState<PricePoint[]>(
    STOCK_TOKENS.map((token) => ({ token, price: null, stale: false })),
  );

  useEffect(() => {
    if (!client) return;
    let cancelled = false;

    async function load() {
      const now = Math.floor(Date.now() / 1000);
      const next = await Promise.all(
        STOCK_TOKENS.map(async (token) => {
          try {
            const { price, updatedAt } = await readFeed(client!, token.feed);
            return {
              token,
              price,
              stale: isStale(updatedAt, token.heartbeatSec, now),
            } satisfies PricePoint;
          } catch {
            return { token, price: null, stale: true, error: true };
          }
        }),
      );
      if (!cancelled) setPoints(next);
    }

    load();
    const t = setInterval(load, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [client, intervalMs]);

  return points;
}

import { describe, it, expect } from "vitest";
import { isStale, tokenPrice, basketValue, formatPrice } from "../pricing";

describe("isStale", () => {
  const now = 1_000_000;
  it("fresh feed is not stale", () => {
    expect(isStale(BigInt(now - 100), 86400, now)).toBe(false);
  });
  it("feed older than heartbeat is stale", () => {
    expect(isStale(BigInt(now - 90_000), 86400, now)).toBe(true);
  });
  it("zero updatedAt is stale", () => {
    expect(isStale(0n, 86400, now)).toBe(true);
  });
});

describe("tokenPrice", () => {
  it("total-return feed (multiplier 1e18) returns feed price unchanged", () => {
    expect(tokenPrice(150_00000000n, 10n ** 18n)).toBe(150_00000000n);
  });
  it("applies a 2x multiplier", () => {
    expect(tokenPrice(150_00000000n, 2n * 10n ** 18n)).toBe(300_00000000n);
  });
});

describe("basketValue", () => {
  it("computes a 60/40 weighted value", () => {
    // AAPL $150, MSFT $400 -> 0.6*150 + 0.4*400 = 250
    const v = basketValue([
      { price: 150_00000000n, weightBps: 6000 },
      { price: 400_00000000n, weightBps: 4000 },
    ]);
    expect(v).toBe(250_00000000n);
  });
  it("rejects weights that do not sum to 10000", () => {
    expect(() =>
      basketValue([{ price: 1n, weightBps: 5000 }]),
    ).toThrow(/sum to 10000/);
  });
});

describe("formatPrice", () => {
  it("formats 8-decimal price to 2dp", () => {
    expect(formatPrice(150_12345678n)).toBe("150.12");
  });
});

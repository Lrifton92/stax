import { describe, it, expect } from "vitest";
import {
  toScaledBalance,
  toRawBalance,
  MULTIPLIER_SCALE,
  STOCK_TOKENS,
  B20_REGISTRY,
} from "../b20";

describe("multiplier math", () => {
  it("scaled == raw when multiplier is 1e18", () => {
    expect(toScaledBalance(1000n, MULTIPLIER_SCALE)).toBe(1000n);
  });
  it("2x multiplier doubles scaled balance", () => {
    expect(toScaledBalance(1000n, 2n * MULTIPLIER_SCALE)).toBe(2000n);
  });
  it("toRawBalance is the inverse of toScaledBalance", () => {
    const raw = 1234n;
    const m = 3n * MULTIPLIER_SCALE;
    expect(toRawBalance(toScaledBalance(raw, m), m)).toBe(raw);
  });
  it("toRawBalance throws on zero multiplier", () => {
    expect(() => toRawBalance(100n, 0n)).toThrow(/zero/);
  });
});

describe("token registry", () => {
  it("registry address is the documented B20 registry", () => {
    expect(B20_REGISTRY.toLowerCase()).toBe(
      "0x3f3e8cf41cdd3b1d118c16471ab0113dfddd5cad",
    );
  });
  it("every token has symbol, address and feed", () => {
    for (const t of STOCK_TOKENS) {
      expect(t.symbol).toBeTruthy();
      expect(t.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
      expect(t.feed).toMatch(/^0x[0-9a-fA-F]{40}$/);
    }
  });
});

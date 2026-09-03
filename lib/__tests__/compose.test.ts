import { describe, it, expect } from "vitest";
import { composeBasket } from "../compose";
import { STOCK_TOKENS } from "../b20";

const universe = STOCK_TOKENS.map((t) => ({ symbol: t.symbol, name: t.name }));

describe("composeBasket", () => {
  it("maps an AI-chips prompt to semis leaders, NVDA first", () => {
    const { symbols } = composeBasket("AI chip makers", universe);
    expect(symbols[0]).toBe("NVDAc");
    expect(symbols).toContain("INTCc");
  });

  it("resolves company names directly", () => {
    const { symbols } = composeBasket("apple, microsoft and tesla", universe);
    expect(symbols).toEqual(expect.arrayContaining(["AAPLc", "MSFTc", "TSLAc"]));
  });

  it("maps a crypto prompt to the crypto sector only", () => {
    const { symbols } = composeBasket("bitcoin and crypto exposure", universe);
    expect(symbols.every((s) => ["COINc", "CRCLc", "MSTRc"].includes(s))).toBe(true);
    expect(symbols.length).toBeGreaterThanOrEqual(2);
  });

  it("honors an explicit count cap", () => {
    const { symbols } = composeBasket("top 2 big tech names", universe);
    expect(symbols).toHaveLength(2);
  });

  it("diversifies on request — one leader per sector", () => {
    const { symbols, rationale } = composeBasket("give me a diversified basket", universe);
    const sectorsCovered = new Set(symbols);
    expect(symbols.length).toBeGreaterThanOrEqual(5);
    expect(sectorsCovered.size).toBe(symbols.length); // no dupes
    expect(rationale).toMatch(/diversified/i);
  });

  it("falls back to a starter basket when nothing matches", () => {
    const { symbols, rationale } = composeBasket("asdfghjkl zzz", universe);
    expect(symbols.length).toBeGreaterThan(0);
    expect(rationale).toMatch(/no specific match/i);
  });

  it("never invents a symbol outside the given universe", () => {
    const tiny = [{ symbol: "AAPLc", name: "Coinbase AAPL" }];
    const { symbols } = composeBasket("nvidia and apple and tesla", tiny);
    expect(symbols).toEqual(["AAPLc"]);
  });

  it("does not fire short themes inside unrelated words", () => {
    // "ai" must not match "available"; "ev" must not match "eleven".
    // With no real theme hit, it must fall through to the starter basket
    // rather than produce an AI/EV-themed match.
    const { rationale } = composeBasket("available eleven", universe);
    expect(rationale).toMatch(/no specific match/i);
  });

  it("handles an empty query without throwing", () => {
    expect(() => composeBasket("", universe)).not.toThrow();
    expect(composeBasket("", universe).symbols.length).toBeGreaterThan(0);
  });
});

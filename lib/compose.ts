// Natural-language basket composer. Turns a plain-English exposure prompt
// ("AI chip makers", "crypto + big tech", "top 3 growth names") into a set of
// tokens from the live universe, ranked by relevance. Deterministic, offline,
// zero-cost — no key, no network, no per-viewer billing on a public app.
//
// It is a rule engine, not an LLM: company aliases score highest, then themes,
// then sectors. An LLM can later replace scoreQuery() behind a rate-limited
// server route without touching the UI contract.

import { SECTORS } from "./b20";

export type ComposeInput = { symbol: string; name: string };
export type ComposeResult = {
  symbols: string[]; // ranked, strongest first
  rationale: string; // short human explanation of the match
};

// symbol -> weight contribution for a matched term. Higher = stronger pull.
type Hits = Map<string, number>;

const SYMBOLS = Object.keys(SECTORS);
const bySector = (sector: string) =>
  SYMBOLS.filter((s) => SECTORS[s] === sector);

// Company-level aliases — a direct name hit is the strongest signal.
const COMPANY: Record<string, string[]> = {
  AAPLc: ["apple", "iphone", "mac", "aapl"],
  AMZNc: ["amazon", "aws", "amzn", "ecommerce", "e-commerce"],
  COINc: ["coinbase", "coin"],
  CRCLc: ["circle", "usdc", "stablecoin", "crcl"],
  GOOGLc: ["google", "alphabet", "youtube", "android", "googl"],
  INTCc: ["intel", "intc"],
  METAc: ["meta", "facebook", "instagram", "whatsapp", "metaverse"],
  MSFTc: ["microsoft", "windows", "azure", "xbox", "copilot", "msft"],
  MSTRc: ["microstrategy", "strategy", "saylor", "mstr"],
  NVDAc: ["nvidia", "nvda", "cuda", "geforce"],
  SNDKc: ["sandisk", "sndk", "flash storage"],
  SPCXc: ["spacex", "starlink", "rocket", "spcx"],
  TSLAc: ["tesla", "tsla", "musk"],
};

// Theme / sector keywords — each spreads weight across the named tokens.
const THEMES: { terms: string[]; weights: Record<string, number> }[] = [
  {
    terms: ["ai", "artificial intelligence", "machine learning", "ml", "llm", "neural"],
    weights: { NVDAc: 5, MSFTc: 4, GOOGLc: 4, METAc: 3, INTCc: 2 },
  },
  {
    terms: ["chip", "chips", "chipmaker", "semiconductor", "semis", "gpu", "silicon", "foundry"],
    weights: Object.fromEntries(bySector("Semis").map((s) => [s, 4])),
  },
  {
    terms: ["tech", "technology", "big tech", "faang", "mega cap", "megacap", "software", "cloud", "saas", "enterprise"],
    weights: { AAPLc: 4, MSFTc: 4, GOOGLc: 4, METAc: 3, AMZNc: 3 },
  },
  {
    terms: ["crypto", "cryptocurrency", "bitcoin", "btc", "web3", "blockchain", "digital asset", "onchain", "on-chain"],
    weights: Object.fromEntries(bySector("Crypto").map((s) => [s, 4])),
  },
  {
    terms: ["payments", "fintech", "finance", "financial"],
    weights: { COINc: 4, CRCLc: 4 },
  },
  {
    terms: ["consumer", "retail", "shopping"],
    weights: { AMZNc: 5, AAPLc: 3, TSLAc: 2 },
  },
  {
    terms: ["auto", "car", "cars", "vehicle", "ev", "electric"],
    weights: { TSLAc: 5 },
  },
  {
    terms: ["space", "aerospace", "satellite", "orbit"],
    weights: { SPCXc: 5 },
  },
  {
    terms: ["social", "media", "advertising", "ads"],
    weights: { METAc: 5, GOOGLc: 3 },
  },
  {
    terms: ["growth", "hot", "momentum", "trending", "aggressive"],
    weights: { NVDAc: 4, TSLAc: 4, METAc: 3, COINc: 3, MSTRc: 3 },
  },
  {
    terms: ["safe", "defensive", "blue chip", "bluechip", "stable", "dividend", "quality"],
    weights: { AAPLc: 4, MSFTc: 4, GOOGLc: 3 },
  },
];

// bounded, whole-word match so 2-3 letter terms ("ai", "ev", "ml") don't fire
// inside unrelated words.
function mentions(query: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(query);
}

function scoreQuery(query: string): Hits {
  const q = ` ${query.toLowerCase().trim()} `;
  const hits: Hits = new Map();
  const add = (sym: string, w: number) =>
    hits.set(sym, (hits.get(sym) ?? 0) + w);

  for (const [sym, aliases] of Object.entries(COMPANY)) {
    if (aliases.some((a) => mentions(q, a))) add(sym, 6);
  }
  for (const theme of THEMES) {
    if (theme.terms.some((t) => mentions(q, t))) {
      for (const [sym, w] of Object.entries(theme.weights)) add(sym, w);
    }
  }
  return hits;
}

// "top 5", "3 stocks", "pick 4 names" -> a cap on how many to select.
function parseCount(query: string): number | null {
  const m = query
    .toLowerCase()
    .match(/(?:top|pick|give me|choose|only)?\s*(\d{1,2})\s*(?:stocks?|names?|tickers?|companies|picks?)?/);
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  return Number.isFinite(n) && n >= 1 && n <= SYMBOLS.length ? n : null;
}

const DIVERSIFY = /\b(diversif|balanced|spread|all sectors?|across sectors?|mix|broad)\b/i;

// one strongest name per sector, sector order stable for reproducibility.
function diversified(): string[] {
  const order = ["Tech", "Semis", "Crypto", "Consumer", "Auto", "Space"];
  return order.map((sec) => bySector(sec)[0]).filter(Boolean);
}

export function composeBasket(
  query: string,
  universe: ComposeInput[],
): ComposeResult {
  const known = new Set(universe.map((u) => u.symbol));
  const cap = parseCount(query);

  if (DIVERSIFY.test(query)) {
    const picks = diversified().filter((s) => known.has(s));
    const symbols = cap ? picks.slice(0, cap) : picks;
    return { symbols, rationale: `Diversified — one leader per sector (${symbols.length}).` };
  }

  const hits = scoreQuery(query);
  const ranked = [...hits.entries()]
    .filter(([sym]) => known.has(sym))
    .sort((a, b) => b[1] - a[1])
    .map(([sym]) => sym);

  if (ranked.length === 0) {
    const picks = diversified().filter((s) => known.has(s)).slice(0, cap ?? 5);
    return {
      symbols: picks,
      rationale: "No specific match — diversified blue-chip starter basket.",
    };
  }

  const limit = cap ?? Math.min(Math.max(ranked.length, 2), 6);
  const symbols = ranked.slice(0, limit);
  const sectors = [...new Set(symbols.map((s) => SECTORS[s]))];
  return {
    symbols,
    rationale: `Matched ${sectors.join(" · ")} → ${symbols.join(", ")}.`,
  };
}

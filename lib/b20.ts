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

// Coinbase tokenized-stock (B20) tokens on Base with their Chainlink V3 feeds.
// Verified from Base docs (docs.base.org/base-chain/asset-issuance/tokenized-stocks-on-base).
// Feeds return 8 decimals, update on 0.5% deviation or a 24h heartbeat.
export const STOCK_TOKENS: StockToken[] = [
  {
    symbol: "AAPLc",
    name: "Coinbase AAPL",
    address: "0xb200000000000000000000C2e324d24d7eEcd1fb",
    feed: "0x787f13dEa48Db0897CbCDD985de77809D837F988",
    heartbeatSec: 86400,
  },
  {
    symbol: "AMZNc",
    name: "Coinbase AMZN",
    address: "0xb200000000000000000000d9192b6B456483C2E8",
    feed: "0x06A8E4b3aBB3B7543d8396FB2B763d22820cB295",
    heartbeatSec: 86400,
  },
  {
    symbol: "COINc",
    name: "Coinbase COIN",
    address: "0xb200000000000000000000c85a31389D71F3ecfb",
    feed: "0x408e44f504A7371a345F03a73dDC96A4b48e8aa7",
    heartbeatSec: 86400,
  },
  {
    symbol: "CRCLc",
    name: "Coinbase CRCL",
    address: "0xB20000000000000000000019f6E7C675b73C2e4D",
    feed: "0x0231cF2635D1E17bB5c2462cc7504Ba1fBd61f33",
    heartbeatSec: 86400,
  },
  {
    symbol: "GOOGLc",
    name: "Coinbase GOOGL",
    address: "0xb2000000000000000000002D0BA3164cc74f58B7",
    feed: "0x5bF49E0ffA937CE2FfF033c739aD7C634c4D34F2",
    heartbeatSec: 86400,
  },
  {
    symbol: "INTCc",
    name: "Coinbase INTC",
    address: "0xB2000000000000000000004AFF16039bA04bdFBc",
    feed: "0xAB657C39bac0D5886250D70849e2E3E008F2EECB",
    heartbeatSec: 86400,
  },
  {
    symbol: "METAc",
    name: "Coinbase META",
    address: "0xb2000000000000000000008bC8786B856E61707C",
    feed: "0x6526aE6797A76123638b863AeE4dD27Ba4E4b27D",
    heartbeatSec: 86400,
  },
  {
    symbol: "MSFTc",
    name: "Coinbase MSFT",
    address: "0xB200000000000000000000Ab99cFa739E253872B",
    feed: "0xeB10A6c9aa7E537aEd766C08c35Dae35B321b18c",
    heartbeatSec: 86400,
  },
  {
    symbol: "MSTRc",
    name: "Coinbase MSTR",
    address: "0xb2000000000000000000004884b426556b92883d",
    feed: "0xB3cE282CD188b35DA0E38D8Bc7d58e33173D202a",
    heartbeatSec: 86400,
  },
  {
    symbol: "NVDAc",
    name: "Coinbase NVDA",
    address: "0xb20000000000000000000078ee7ce2fE4908108C",
    feed: "0x04689a41629776563E6822F76f2e57D148d28513",
    heartbeatSec: 86400,
  },
  {
    symbol: "SNDKc",
    name: "Coinbase SNDK",
    address: "0xb200000000000000000000397293Cb8cda9a10c5",
    feed: "0x388b0dC46C0Fb05A74BeE0994fa5b02c6Fcca2eA",
    heartbeatSec: 86400,
  },
  {
    symbol: "SPCXc",
    name: "Coinbase SPCX",
    address: "0xb2000000000000000000007b9fcbd005511aCBd5",
    feed: "0x6A634B235903C4ad6376892180d6fF8612e3Fa68",
    heartbeatSec: 86400,
  },
  {
    symbol: "TSLAc",
    name: "Coinbase TSLA",
    address: "0xb2000000000000000000001e800a7f5189430cD0",
    feed: "0xFaf869185383a24F8cb00e27BdA6b63B9905DCb4",
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

// Sector classification for filtering (keyed by token symbol).
export const SECTORS: Record<string, string> = {
  AAPLc: "Tech",
  MSFTc: "Tech",
  GOOGLc: "Tech",
  METAc: "Tech",
  NVDAc: "Semis",
  INTCc: "Semis",
  SNDKc: "Semis",
  AMZNc: "Consumer",
  TSLAc: "Auto",
  COINc: "Crypto",
  CRCLc: "Crypto",
  MSTRc: "Crypto",
  SPCXc: "Space",
};

export function sectorOf(symbol: string): string {
  return SECTORS[symbol] ?? "Other";
}

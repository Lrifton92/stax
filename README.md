# STAX — Tokenized Stock Baskets on Base

A **Base Mini App** to build, value, save onchain, and set alerts on baskets of
**Coinbase tokenized stocks** (B20). A wallet-native portfolio layer for the
tokenized-stock ecosystem. Built for the Base **Builder Quest — Tokenized Stocks**.

## Live
- **App:** https://stax-mocha.vercel.app
- **Registry contract (Base mainnet, verified):**
  [`0x17E95A8A4D7bca00361c262593fb1abB0Cf35271`](https://base.blockscout.com/address/0x17e95a8a4d7bca00361c262593fb1abb0cf35271?tab=contract)

## What it does
- **Live prices** for tokenized stocks via Chainlink feeds — multiplier-adjusted
  and staleness-guarded (stale feeds are flagged, not trusted).
- **AI composer:** describe an exposure in plain English ("AI chip makers",
  "big tech + crypto", "top 3 growth names") and get a ranked basket, with the
  match explained (`lib/compose.ts`, rule engine — deterministic, zero-cost).
- **Basket builder (hero):** pick stocks, weight them, see live per-unit value,
  and **save the basket onchain** in one gasless tap (`BasketRegistry.createBasket`).
- **Alerts:** set an onchain price alert per basket.
- **Trade handoff:** verify any asset on-chain and reach the compliant venue for
  eligible accounts — no faked DEX route for gated tokens.
- **Memestock touch:** link your own B20 community token (OGB) to a basket.
- **Eligibility-aware:** saving + alerts work for any wallet; trading of the
  underlying stock tokens is gated to compliance-authorized accounts.

## Base stack used
OnchainKit + MiniKit (Mini App), Base Account / Smart Wallet, Paymaster (gasless),
Builder Codes (attribution), B20 registry + Chainlink feeds, base-foundry
(contract + tests, deployed & verified on Base mainnet).

## Architecture
- `contracts/BasketRegistry.sol` — custody-free onchain baskets + alerts (base-forge, 9 tests).
- `lib/b20.ts`, `lib/pricing.ts`, `lib/compose.ts` — reads (registry, multiplier,
  Chainlink staleness) + the NL basket composer (vitest, 23 tests).
- `lib/registry.ts`, `lib/builderCode.ts` — ABI + attribution.
- `hooks/`, `components/` — wallet connect, StockGrid, BasketBuilder, AIComposer, TradePanel.
- `app/` — Next.js App Router, OnchainKitProvider + MiniKit, Mini App manifest.

## Develop
```bash
npm install
cp .env.example .env   # fill NEXT_PUBLIC_ONCHAINKIT_API_KEY (cdp.coinbase.com), paymaster, builder code
npm run dev            # http://localhost:3000
npm test               # lib tests (vitest)
```

Contract tests (WSL, base-foundry):
```bash
cd contracts && base-forge test -vv
```

## Deploy (Soufian signs — doctrine: Claude prepares, Soufian signs)
1. Deploy the registry to Base mainnet:
   ```bash
   cd contracts
   base-forge script script/DeployBasketRegistry.s.sol \
     --rpc-url https://mainnet.base.org \
     --account lrifton-0x1dee --sender 0x1deeaEc4250e66702E22777Ec1E3A70B19745A72 \
     --broadcast
   ```
   Copy the deployed address into `NEXT_PUBLIC_REGISTRY_ADDRESS`.
2. `vercel deploy --prod` (set env vars in Vercel). Set `NEXT_PUBLIC_URL` to the domain.
3. Generate the Mini App manifest signature: `npx create-onchain --manifest`
   → fill `FARCASTER_HEADER/PAYLOAD/SIGNATURE`.

## Builder Quest submission
- Loom demo (≤ 2 min) explaining STAX, tagging **@buildonbase**.
- Google Form: Project Name **STAX**; problem — *"a wallet-native way to build,
  value, save onchain and alert on baskets of Coinbase tokenized stocks on Base"*;
  demo video URL; live project URL; **Builder Code** (from base.dev).

## Notes
- Tokenized stocks are issued by Coinbase, available to eligible non-US users only.
- The full 14-token + feed list is enumerated at build via the B20 registry /
  `B20Created` events; the repo seeds verified addresses.

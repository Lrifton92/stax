# STAX — Builder Quest submission package

Quest: Base **Builder Quest — Tokenized Stocks** ($5,000). Submit via (1) a Loom
demo posted on X tagging **@buildonbase**, and (2) the Google Form.

## Links
- **Live app:** https://stax-mocha.vercel.app
- **Source (public):** https://github.com/Lrifton92/stax
- **Registry contract (Base mainnet, verified):**
  https://base.blockscout.com/address/0x17e95a8a4d7bca00361c262593fb1abb0cf35271?tab=contract
- **Builder Code:** `bc_7bkuc3p1` (encoded suffix in Vercel `NEXT_PUBLIC_BUILDER_CODE`)

## Google Form answers
- **Project Name:** `STAX`
- **What does it solve (1-2 lines):**
  `STAX is a wallet-native way to build, value, save onchain, and set price alerts on baskets of Coinbase tokenized stocks (B20) on Base. It turns single tokenized stocks into a personal, composable index — with an AI composer that turns plain-English exposure into a conviction-weighted basket, live multiplier- and staleness-aware Chainlink pricing, and a custody-free onchain registry.`
- **Demo Video Link:** `<Loom URL>`
- **Live Project Link:** `https://stax-mocha.vercel.app`
- **Builder Code:** `bc_7bkuc3p1`

## What's built (final state)
- **AI composer** — plain-English exposure ("AI chip makers", "big tech + crypto",
  "top 3 growth") → conviction-weighted basket, match explained (deterministic
  rule engine, no key/cost).
- **Basket builder** — pick/weight the full 13-token Base catalogue, live per-unit
  value, save onchain (custody-free `BasketRegistry.createBasket`).
- **Portfolio** — saved baskets with live value + per-token price alerts onchain.
- **Trade** — verify any asset onchain + compliant-venue handoff (no faked DEX
  route for compliance-gated B20 tokens).
- **App-shaped**: tabbed Build / Portfolio / Trade, responsive down to the Base
  Mini App mobile frame, Kore-terminal aesthetic.
- **Base stack**: OnchainKit + MiniKit (Mini App), Base Account / Smart Wallet,
  Builder Codes, B20 registry + Chainlink feeds, base-foundry.

## Loom demo script (~90s, tag @buildonbase in the X post)
1. **Hook (10s):** "Coinbase tokenized stocks are live on Base — but there's no
   wallet-native way to hold them as a portfolio. STAX fixes that."
2. **AI composer (20s):** type "AI chip makers" → basket fills conviction-weighted
   (NVDA heaviest), match explained. "Describe an exposure, get an index."
3. **Live prices (10s):** the 13-token catalogue, prices are live Chainlink feeds,
   multiplier-adjusted and flagged stale when a feed is old.
4. **Save onchain (20s):** connect wallet, "Save basket onchain" → real tx on Base
   (small fee; sponsored for Smart Wallet accounts). "A real onchain interaction
   from your wallet — and it auto-includes my OGB community token."
5. **Portfolio + alert (15s):** Portfolio tab shows the saved basket with live
   value; set a price alert onchain.
6. **Close (15s):** "Custody-free contract, verified onchain and open source.
   Covers the full Base tokenized-stock catalogue. Runs as a Mini App inside the
   Base app. @buildonbase"

## Pre-submission checklist
- [x] Builder Code `bc_7bkuc3p1` (base.dev), encoded suffix in Vercel env.
- [x] `BasketRegistry` deployed to Base mainnet: `0x17E95A8A4D7bca00361c262593fb1abB0Cf35271`
      (tx 0xc69a52b1, block 50816781) and **verified** on Blockscout.
- [x] Real save from 0x1dee on the live site (2 baskets, tx 0x13b4830f) — real interaction proven.
- [x] Deployed to Vercel: https://stax-mocha.vercel.app (NEXT_PUBLIC_* set).
- [x] Source pushed public: https://github.com/Lrifton92/stax.
- [x] OnchainKit client key restricted to `stax-mocha.vercel.app` (CDP portal).
- [x] Security pass: 0 high/critical deps (overrides), hardening headers, contract audited.
- [deferred] Sign the Mini App manifest (`accountAssociation`) — bonus, not required
      to submit. Needs a Farcaster account (currently lost). When available: sign the
      domain `stax-mocha.vercel.app` at farcaster.xyz → Developers → Mini Apps →
      Manifest, then set `FARCASTER_HEADER/PAYLOAD/SIGNATURE` in Vercel env + redeploy.
      The app runs and carries full `miniapp` metadata without it.
- [ ] (optional) Paymaster endpoint → `NEXT_PUBLIC_CDP_PAYMASTER` for gasless Smart-Wallet saves.
- [ ] Record Loom, post on X tagging @buildonbase, submit the Google Form.

## Verified proof (true today)
- Contract custody-free, verified onchain; 9 base-forge tests; 27 vitest tests; build green.
- Live Chainlink prices for all 13 tokens read from Base mainnet.
- `npm audit`: 0 high/critical (27 moderate remain, all transitive in the wallet stack).

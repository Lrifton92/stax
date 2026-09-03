# STAX — Builder Quest submission package

Quest: Base **Builder Quest — Tokenized Stocks** ($5,000). Submit via (1) a Loom
demo posted on X tagging **@buildonbase**, and (2) the Google Form.

## Google Form answers (fill URLs after deploy)
- **Project Name:** `STAX`
- **What does it solve (1-2 lines):**
  `STAX is a wallet-native way to build, value, save onchain, and set price alerts on baskets of Coinbase tokenized stocks on Base. It turns single tokenized stocks into a personal, composable index with live multiplier- and staleness-aware Chainlink pricing.`
- **Demo Video Link:** `<Loom URL>`  (record per script below)
- **Live Project Link:** `https://stax-mocha.vercel.app`
- **Builder Code:** `bc_7bkuc3p1`  (encoded hex suffix already in .env / Vercel as NEXT_PUBLIC_BUILDER_CODE)

## Loom demo script (~90s, tag @buildonbase in the X post)
1. **Hook (10s):** "Coinbase tokenized stocks are live on Base, but there's no
   wallet-native way to hold them as a portfolio. STAX fixes that."
2. **Live prices (15s):** show the grid — 13 tokenized stocks, prices are live
   Chainlink feeds, multiplier-adjusted, and flagged stale when a feed is old.
3. **Build a basket (20s):** select AAPLc + NVDAc + MSFTc, weights auto-balance,
   basket value updates live.
4. **Save onchain (20s):** connect Base Account (passkey), tap "Save basket
   onchain" — gasless via Paymaster. Show the tx confirm. "That's a real onchain
   interaction, no gas, from any wallet."
5. **Alert + memestock (15s):** set a price alert on the basket; toggle "Link OGB
   as community token" to show the memestock angle.
6. **Close (10s):** "Built entirely on the Base stack — OnchainKit, MiniKit,
   Base Account, Paymaster, Builder Codes, B20 + Chainlink. It runs as a Mini App
   inside the Base app. @buildonbase"

## Pre-submission checklist (Soufian)
- [x] Builder Code `bc_7bkuc3p1` generated (base.dev), encoded suffix in .env + Vercel.
- [ ] Add OnchainKit paymaster endpoint → `.env` `NEXT_PUBLIC_CDP_PAYMASTER` (CDP).
- [x] BasketRegistry deployed to Base mainnet: 0x17E95A8A4D7bca00361c262593fb1abB0Cf35271 (tx 0xc69a52b1..., block 50816781).
- [~] (done) Deploy `BasketRegistry` to Base mainnet (you sign):
      `cd contracts && base-forge script script/DeployBasketRegistry.s.sol --rpc-url https://mainnet.base.org --account lrifton-0x1dee --sender 0x1deeaEc4250e66702E22777Ec1E3A70B19745A72 --broadcast`
      → put address in `.env` `NEXT_PUBLIC_REGISTRY_ADDRESS`.
- [x] Deployed to Vercel: https://stax-mocha.vercel.app (NEXT_PUBLIC_* set).
- [ ] Restrict the OnchainKit client key to the Vercel domain (CDP portal).
- [ ] Sign the Mini App manifest: `npx create-onchain --manifest` → FARCASTER_* env.
- [ ] Do a real save from 0x1dee on the live site → confirms a real interaction.
- [ ] Record Loom, post on X tagging @buildonbase, submit the Google Form.

## Onchain-verified proof of concept (already true today)
- Contract compiles + 9 base-forge tests pass; libs 14 vitest tests pass; app builds.
- Live Chainlink prices read from Base mainnet for all 13 tokens (screenshot).

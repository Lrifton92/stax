# STAX — Tokenized Stock Baskets on Base (design spec)

Date : 2026-09-02 · Auteur : Lrifton92 (Soufian J) · Wallet farm : `0x1dee...5A72`
Cible : Base Builder Quest — Tokenized Stocks ($5,000). Soumission = démo Loom taguant @buildonbase + Google Form (Project Name, problème 1-2 lignes, demo video, live link, Builder Code).

## 1. Problème & pitch
Les Coinbase Tokenized Stocks (standard B20) sont live sur Base mais il manque un front-end grand public pour **composer, valoriser et suivre** un portefeuille d'actions tokenisées de façon native au wallet. STAX est une **Base Mini App** qui laisse n'importe qui construire un panier d'actions tokenisées (un « index perso »), le **sauvegarder on-chain**, y attacher des **alertes de prix**, et — pour les utilisateurs éligibles — l'exécuter. Front-end de portefeuille que Base n'a pas, brique intégrable au wallet.

Pitch 1-2 lignes (pour le form) : « STAX lets anyone build, value and track a personal basket of Coinbase tokenized stocks on Base, save it onchain, and set price alerts — a wallet-native portfolio layer for the B20 tokenized-stock ecosystem. »

## 2. Contrainte décisive : éligibilité
Les tokens B20 d'actions (AAPLc, MSFTc…) sont **gated conformité** : transferts vers une adresse non autorisée révertés (`isAuthorized(policyID, account)`), réservés aux utilisateurs KYC non-US. Le wallet farm `0x1dee` **ne détiendra pas** ces tokens. Conséquence de design : les **interactions réelles** de STAX ne dépendent PAS de la détention des actions.
- Interactions réelles pour tout wallet (dont 0x1dee) : **save/rebalance de panier** + **poser une alerte** = tx vers `BasketRegistry`.
- Détection `isAuthorized` du wallet connecté → si éligible, un bouton **Execute (buy)** s'active (Swap OnchainKit) ; sinon grisé, mais save+alertes pleinement fonctionnels.

## 3. Forme & stack Base (réutilisation maximale)
- **Next.js (App Router)** + **MiniKit** (`MiniKitProvider`, manifeste Mini App) → tourne en site web autonome ET dans l'app Base.
- **OnchainKit** (`@coinbase/onchainkit`) : `<Wallet>/<ConnectWallet>`, `<Identity>/<Name>/<Avatar>` (Basenames), `<Transaction>` (cycle de vie tx + sponsorship), `<Swap>` (flux buy éligibles).
- **Base Account / Smart Wallet** : connexion passkey.
- **Paymaster / gas sponsorship** : save-basket et alertes **sans gas** pour l'utilisateur.
- **Sub Accounts** : compte app-scoped pour enchaîner rebalance/alertes sans repopup.
- **Spend Permissions** : pré-autorisation, prête pour l'exécution récurrente (DCA futur).
- **Base Pay** : paiement stablecoin one-tap (flux premium/éligibles).
- **Basenames** : identité du créateur sur chaque panier.
- **Builder Codes** : attribution des interactions (et champ requis du form). Encodé sur les tx.
- **base-std / base-forge / base-anvil** (WSL) : contrat `BasketRegistry` + tests sur fork.
- **wagmi/viem** : lectures RPC (registre, feeds, multiplicateurs).
- Déploiement front : **Vercel**. Contrat : **Base mainnet** (Soufian signe via base-forge).

## 4. Contrat on-chain — `BasketRegistry.sol`
Rôle unique : stocker les paniers et alertes d'un utilisateur, émettre des events indexables. Aucune détention/transfert d'actions gatées.
Structures :
- `Basket { address owner; string name; address[] tokens; uint16[] weightsBps; address communityToken; uint64 createdAt; uint64 updatedAt; }` (Σ weightsBps == 10000).
- `Alert { uint256 basketId; address token; int256 threshold; uint8 direction; bool active; }` (direction 0=below,1=above ; threshold en 8 décimales, aligné Chainlink).
Fonctions : `createBasket`, `updateBasket` (owner-only), `deleteBasket`, `setAlert`, `clearAlert`, `linkCommunityToken` (OGB). Views : `getBasket`, `basketsOf(address)`.
Events : `BasketCreated/Updated/Deleted`, `AlertSet/Cleared`, `CommunityTokenLinked` → indexation front (pas de backend lourd au départ).
Sécurité : owner-only sur mutations, bornes (max tokens/panier, Σ poids), pas de fonds détenus (surface d'attaque minimale). Tests base-forge : create/update/delete, contrôle d'accès, invariants de poids, alertes.
Doctrine : Claude prépare le script de déploiement + les tx ; **Soufian signe** le déploiement et les tx de panier (vraies interactions 0x1dee).

## 5. Couche données (module partagé)
- `lib/b20.ts` : registre `0x3f3E8cf41cdd3b1D118c16471aB0113DfDDd5CaD`, liste des 14 tokens (AAPLc `0xb200…C2e324…`, AMZNc `0xb200…d9192b…`, …), métadonnées (name/symbol via `updateName`-aware), multiplicateur + pause status.
- `lib/pricing.ts` : Chainlink V3 `latestRoundData()` (8 décimales, total-return), **garde staleness** (`updatedAt` + heartbeat), prix = market × multiplier, valorisation de panier. Feeds ex. AAPL `0x787f13dEa48Db0897CbCDD985de77809D837F988`.
- Fallback prix off-chain (CoinGecko) si feed périmé → badge « stale », valorisation marquée non fiable.

## 6. Features (un seul produit, 3 niveaux)
1. **Héros — Basket builder** : grille des 14 actions, sélection + poids (sliders, Σ=100%), **valorisation live** multiplier/staleness-aware, sauvegarde on-chain (`createBasket`). Dashboard des paniers sauvés (relecture via events).
2. **Extension — Alertes/intents** : sur un panier ou une action, poser une alerte de prix (`setAlert`). Même registre, une ligne de plus.
3. **Touche — Memestock** : lier OGB (`0xb200…026aFdac7C1D621b78`) comme token communautaire d'un panier (`linkCommunityToken`) → badge + narratif « Memes and Agents » de la RFB. PAS de routing de frais (hors scope).

## 7. UI/UX — immersion « finance numérique » (profil : techno/épuré, dark glass, mission-control, premium-futuriste)
- Fond quasi-noir (#0A0B0D), panneaux verre dépoli, fond de grille discret façon salle de marché.
- Accent bleu Base (#0052FF), vert sobre gains / rouge muté pertes, jamais criard (WCAG ≥ 4.5:1).
- Chiffres en **police mono** (sensation data) ; tickers animés, roulement de chiffres à l'update, sparklines.
- **Un seul moteur d'animation** (Motion), 60fps, `prefers-reduced-motion` respecté, `overflow-x: clip`. Gate `zero-jank-scroll` avant release.
- **Mobile-first** (la Mini App tourne dans l'app Base sur téléphone).

## 8. Architecture des unités
- `contracts/BasketRegistry.sol` (+ tests base-forge) — état on-chain, une responsabilité.
- `lib/b20.ts`, `lib/pricing.ts` — lectures, testables isolément.
- `lib/builderCode.ts` — attribution Builder Code sur les tx.
- `hooks/useBaskets.ts`, `useCreateBasket.ts`, `useSetAlert.ts` — wagmi.
- `components/` : `Shell`, `StockGrid`, `BasketBuilder`, `BasketCard`, `AlertForm`, `EligibilityBadge`, `PriceTicker`, `Sparkline`, `OGBLinkBadge`.
- `app/` : provider MiniKit+OnchainKit, page principale, manifeste Mini App.

## 9. Gestion d'erreurs
Feed périmé → badge « stale » + valorisation bloquée. Tx échouée → toast clair (OnchainKit `<Transaction>`). Wallet non éligible → Execute grisé, save+alertes actifs. RPC down → retry + message. Multiplicateur en cours de MAJ (pause) → figer la valorisation, prévenir.

## 10. Tests
- Unitaires `lib/pricing.ts` (multiplier, staleness, valorisation) et `lib/b20.ts`.
- Contrat base-forge : create/update/delete, access control, invariants poids, alertes.
- Smoke fork base-anvil (lectures registre/feeds réelles).
- Manuel : connexion mainnet 0x1dee → 1 createBasket réel = preuve d'interaction.

## 11. Livraison quête
- Contrat déployé Base mainnet (Soufian signe), front Vercel + manifeste Mini App, Builder Code dans le form.
- Démo Loom (≤ 2 min) taguant @buildonbase + Google Form rempli.
- README + capture. Deadline exacte non affichée (Builder Quests ~1-2 sem.) → livrer vite.

## 12. Hors scope (YAGNI)
Routing de frais mémestock, backend d'exécution d'ordres automatique, multi-chain, notifications push serveur (les alertes sont on-chain + lues côté client au départ), détention/custody d'actifs.

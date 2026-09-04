"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import {
  WagmiProvider,
  cookieStorage,
  createConfig,
  createStorage,
  http,
  useReconnect,
} from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { baseAccount } from "wagmi/connectors";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";

// We own the wagmi config (OnchainKit detects an existing WagmiProvider and
// reuses it) so we can control reconnection:
//  - `reconnectOnMount={false}` stops wagmi from silently re-opening the
//    Base Account session on every page load. That silent attempt is what
//    produced the "STAX wants to continue in Base Account – Try again" popup
//    (the SDK needs a user gesture to open its window; on load it is blocked).
//  - `<InjectedReconnect />` still restores injected EOAs (MetaMask / Rabby)
//    automatically: they reconnect without any popup.
//  - Base Account / Smart Wallet users reconnect with one click on the wallet
//    button, which is a real user gesture, so the window opens normally.
// Connector order matters: MiniKit's AutoConnect uses connectors[0] when the
// app runs inside the Base app, so the Farcaster Mini App connector goes first.
const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;
const appLogoUrl = process.env.NEXT_PUBLIC_URL
  ? `${process.env.NEXT_PUBLIC_URL}/icon.png`
  : undefined;

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    farcasterMiniApp(),
    baseAccount({ appName: "STAX", appLogoUrl }),
    // Injected EOAs (MetaMask, Rabby…) are discovered via EIP-6963.
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: apiKey
      ? http(`https://api.developer.coinbase.com/rpc/v1/base/${apiKey}`)
      : http(),
    [baseSepolia.id]: apiKey
      ? http(`https://api.developer.coinbase.com/rpc/v1/base-sepolia/${apiKey}`)
      : http(),
  },
});

function InjectedReconnect() {
  const { reconnect } = useReconnect();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const injected = wagmiConfig.connectors.filter((c) => c.type === "injected");
    if (injected.length) reconnect({ connectors: injected });
  }, [reconnect]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={apiKey}
          chain={base}
          config={{
            appearance: { mode: "dark", name: "STAX" },
            paymaster: process.env.NEXT_PUBLIC_CDP_PAYMASTER || undefined,
            wallet: { preference: "all" },
          }}
          miniKit={{ enabled: true }}
        >
          <InjectedReconnect />
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

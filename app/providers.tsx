"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { base } from "wagmi/chains";
import type { ReactNode } from "react";

// OnchainKitProvider (v1.x) sets up wagmi + react-query internally and, with
// `miniKit`, mounts the MiniKit provider so STAX runs as a Base Mini App.
// Paymaster makes basket-save / alert txs gasless for the user.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: { mode: "dark", name: "STAX" },
        paymaster: process.env.NEXT_PUBLIC_CDP_PAYMASTER || undefined,
        // 'all' = let the user pick an injected EOA (MetaMask/Rabby) instead of
        // being forced into the Coinbase Smart Wallet passkey popup.
        wallet: { preference: "all" },
      }}
      miniKit={{ enabled: true }}
    >
      {children}
    </OnchainKitProvider>
  );
}

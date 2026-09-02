import type { Metadata } from "next";
import "../styles/tokens.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "STAX — Tokenized Stock Baskets on Base",
  description:
    "Build, value and track a personal basket of Coinbase tokenized stocks on Base. Save it onchain, set price alerts. A wallet-native portfolio layer for the B20 ecosystem.",
  openGraph: {
    title: "STAX — Tokenized Stock Baskets on Base",
    description:
      "Build, value and track baskets of Coinbase tokenized stocks on Base.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

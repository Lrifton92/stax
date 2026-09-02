import type { Metadata } from "next";
import "../styles/tokens.css";
import { Providers } from "./providers";

const SITE = process.env.NEXT_PUBLIC_URL ?? "https://stax-mocha.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "STAX — Tokenized Stock Baskets on Base",
  description:
    "Build, value and track a personal basket of Coinbase tokenized stocks on Base. Save it onchain, set price alerts. A wallet-native portfolio layer for the B20 ecosystem.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "STAX — Tokenized Stock Baskets on Base",
    description:
      "Build, value and track baskets of Coinbase tokenized stocks on Base.",
    images: ["/og.png"],
    url: SITE,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "STAX — Tokenized Stock Baskets on Base",
    description:
      "Build, value and track baskets of Coinbase tokenized stocks on Base.",
    images: ["/og.png"],
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
        {/* Base Dashboard domain verification (app registered as STAX) */}
        <meta name="base:app_id" content="6a982505cfa2c998e36b5afa" />
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

import type { NextConfig } from "next";
import path from "path";

// STAX does not use x402 payment signing (Base Pay server charge). The Coinbase
// CDP SDK pulls the whole optional @x402/* family transitively (core/evm/svm),
// which is not installed and breaks the build. Replace every @x402/* import with
// an empty stub. Wallet connect / basket txs are unaffected.
// Hardening headers. Deliberately NO Content-Security-Policy or X-Frame-Options:
// STAX is a Base Mini App that must be embeddable in the Base/Farcaster host
// frame, and a strict CSP would break the many wallet connectors' runtime fetches
// and WebSocket relays. These headers harden without touching framing or wallets.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  webpack: (config, { webpack }) => {
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^(@x402\/|pino-pretty$)/,
        path.resolve(__dirname, "lib/empty-x402.js"),
      ),
    );
    return config;
  },
};
export default nextConfig;

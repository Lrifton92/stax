import type { NextConfig } from "next";

// STAX does not use x402 payment signing (Base Pay server charge). The CDP SDK
// pulls optional @x402/evm and @x402/svm chains transitively; stub them so the
// client bundle builds. Wallet connect / basket txs are unaffected.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@x402/evm": false,
      "@x402/svm": false,
      "@x402/svm/exact/client": false,
    };
    return config;
  },
};
export default nextConfig;

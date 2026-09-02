import type { NextConfig } from "next";
import path from "path";

// STAX does not use x402 payment signing (Base Pay server charge). The Coinbase
// CDP SDK pulls the whole optional @x402/* family transitively (core/evm/svm),
// which is not installed and breaks the build. Replace every @x402/* import with
// an empty stub. Wallet connect / basket txs are unaffected.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { webpack }) => {
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^@x402\//,
        path.resolve(__dirname, "lib/empty-x402.js"),
      ),
    );
    return config;
  },
};
export default nextConfig;

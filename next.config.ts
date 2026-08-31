import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    proxyPrefetch: "flexible",
  },
};

export default nextConfig;

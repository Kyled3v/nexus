import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyPrefetch: "flexible",
  },
};

export default nextConfig;

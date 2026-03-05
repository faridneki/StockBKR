import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  eslint: {
    // Attention: cela désactive ESLint pendant le build en production
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

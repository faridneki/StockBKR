// next.config.ts
import type { NextConfig } from 'next';

// Utilisation de require au lieu de import
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withPWA(nextConfig);
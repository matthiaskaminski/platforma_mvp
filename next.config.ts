import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zotnacipqsjewlzofpga.supabase.co',
        pathname: '/storage/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@prisma/client'],
  },
};

export default nextConfig;

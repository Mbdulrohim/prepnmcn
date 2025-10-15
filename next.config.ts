import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable webpack optimizations that can cause cyclic dependency issues
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Disable certain optimizations for server-side builds
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
      };
    }
    return config;
  },
  // Move typeorm to server external packages to avoid bundling issues
  serverExternalPackages: ['typeorm'],
};

export default nextConfig;

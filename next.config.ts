import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

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
  // Keep Node/workerd-specific packages external so runtime-specific exports resolve correctly.
  serverExternalPackages: [
    "typeorm",
    "reflect-metadata",
    "@types/node",
    "pg",
    "pg-cloudflare",
  ],
  turbopack: {},
};

initOpenNextCloudflareForDev();

export default nextConfig;

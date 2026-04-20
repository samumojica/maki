import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@google/generative-ai", "stripe"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

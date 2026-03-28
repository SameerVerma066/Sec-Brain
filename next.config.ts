import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      tailwindcss: "tailwindcss",
    },
  },
};

export default nextConfig;

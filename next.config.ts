import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/risk-intelligence-network",
        destination: "/network",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

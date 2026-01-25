import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: '/analyze',
        destination: '/analyse',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;

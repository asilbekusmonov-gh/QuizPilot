import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Cloudflare tunnel origin for Webpack HMR (auto-reload)
  allowedDevOrigins: [
    'decimal-tape-latest-sampling.trycloudflare.com'
  ]
};

export default nextConfig;

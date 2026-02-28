import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: undefined, // Ensure we're not in static export mode
  trailingSlash: false,
  distDir: '.next',
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // small Docker image
  poweredByHeader: false,
};

export default nextConfig;

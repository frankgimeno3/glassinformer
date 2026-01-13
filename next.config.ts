import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["sequelize"],
  outputFileTracingIncludes: {
    "*": ["./certs/**/*"],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "source.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "unsplash.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;

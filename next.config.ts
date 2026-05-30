import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/mediakit", destination: "/advertise", permanent: true }];
  },
  // Standalone breaks Amplify WEB_COMPUTE (symlink errors on Lambda). Vercel does not need it.
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
      { protocol: "https", hostname: "djjo025o2wqll.cloudfront.net", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "source.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "unsplash.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;

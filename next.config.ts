import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    serverExternalPackages: ['sequelize'],
    outputFileTracingIncludes: {
        '*': ['./certs/**/*']
    },
    // Optimizations for Vercel
    compress: true,
    poweredByHeader: false,
    reactStrictMode: true,
    // Optimize images
    images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'source.unsplash.com',
            },
        ],
    },
    // Experimental features for better performance
    // Note: optimizeCss disabled due to LightningCSS native module issues on Vercel
    // experimental: {
    //     optimizeCss: true,
    // },
    // Headers for caching
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                ],
            },
            {
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;

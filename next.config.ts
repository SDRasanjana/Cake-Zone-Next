/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    unoptimized: true, // Disable optimization for Vercel compatibility
    domains: [], // Add any external domains if needed
  },
  // Ensure static files are properly served
  async headers() {
    return [
      {
        source: "/(.*)\\.(jpg|jpeg|png|gif|svg|ico|webp)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  // Add proper static file handling
  trailingSlash: false,
  // Remove standalone output to prevent file copying issues
  experimental: {
    // Optimize build process
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
};

module.exports = nextConfig;

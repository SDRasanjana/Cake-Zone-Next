/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  env: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    MONGODB_URI: process.env.MONGODB_URI,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  serverExternalPackages: ["stripe"],
};

module.exports = nextConfig;

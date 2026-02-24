/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // This forces Vercel to ignore all quote and image warnings/errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;

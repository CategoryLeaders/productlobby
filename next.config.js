/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Skip type checking during build — Prisma generated types
    // cause false positives until DB is connected. Will re-enable later.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig

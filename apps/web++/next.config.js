/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    NEXT_PUBLIC_STUDIO_URL: process.env.NEXT_PUBLIC_STUDIO_URL || 'http://localhost:4200',
  },
}
module.exports = nextConfig

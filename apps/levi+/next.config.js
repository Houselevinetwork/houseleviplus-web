/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-86b552dafa204cbf92ca954b24de5d35.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-f3f3a2f286664ab89a91655c80b0cbf9.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-8f79dd7db36343f1912455edf30c7e9f.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-de52d89b43c24c21b052efb8b23e9fd8.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-1210c46fee0244f6aa58acd69a6962df.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
    unoptimized: false,
  },
};

module.exports = nextConfig;

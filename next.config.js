/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: [],
  },
  output: "standalone",
};

module.exports = nextConfig;

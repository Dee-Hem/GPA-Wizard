// @ts-nocheck
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // This tells Webpack to provide empty objects for these server-side modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        readline: false,
        dns: false,
        http2: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;

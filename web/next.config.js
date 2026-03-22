const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '..'),
  },
  webpack: (config) => {
    // Allow importing JSON from parent directory
    config.resolve.alias['@data'] = path.join(__dirname, '..');
    return config;
  },
};

module.exports = nextConfig;

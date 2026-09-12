const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

module.exports = nextConfig;

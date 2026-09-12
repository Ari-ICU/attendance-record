const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, './'),
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;

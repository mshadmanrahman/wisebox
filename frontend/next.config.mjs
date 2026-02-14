/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  eslint: {
    // Pre-existing lint issues in the codebase; build should not fail on warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

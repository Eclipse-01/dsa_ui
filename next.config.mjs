/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.flysworld.top']
  },
  async rewrites() {
    return [
      {
        source: '/api/query',
        destination: 'http://localhost:8086/api/v2/query'
      },
      {
        source: '/api/write',
        destination: 'http://localhost:8086/api/v2/write'
      },
      {
        source: '/health',
        destination: 'http://localhost:8086/health'
      }
    ];
  }
};

export default nextConfig;

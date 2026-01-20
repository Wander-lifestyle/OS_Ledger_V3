/** @type {import('next').NextConfig} */
const nextConfig = {
  // Editorial OS Ledger Configuration
  experimental: {
    // Enable server actions for future MCP enhancements
    serverActions: true,
  },
  
  // API Routes configuration
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/mcp',
      },
    ];
  },

  // Headers for MCP protocol
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods', 
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'X-Editorial-OS-Version',
            value: '3.0.0',
          },
          {
            key: 'X-MCP-Protocol',
            value: 'enabled',
          },
        ],
      },
    ];
  },

  // Environment variables validation
  env: {
    EDITORIAL_OS_VERSION: '3.0.0',
    MCP_PROTOCOL_VERSION: '1.0.0',
  },

  // Optimize for Vercel deployment
  output: 'standalone',
  
  // Compress responses
  compress: true,
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Strict mode for development
  reactStrictMode: true,
  
  // SWC minification
  swcMinify: true,
  
  // Image optimization (if needed later)
  images: {
    domains: ['editorialos.com'],
  },
  
  // Bundle analyzer (development only)
  ...(process.env.ANALYZE === 'true' && {
    bundleAnalyzer: {
      enabled: true,
    },
  }),
};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    return [
      // Proxy API calls to backend services
      {
        source: '/api/orchestrator/:path*',
        destination: process.env.ORCHESTRATOR_URL || 'http://localhost:8000/:path*',
      },
      {
        source: '/api/audit/:path*',
        destination: process.env.AUDIT_MCP_URL || 'http://localhost:8010/:path*',
      },
      {
        source: '/api/risk/:path*',
        destination: process.env.RISK_MCP_URL || 'http://localhost:8020/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

import path from 'node:path';
import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.resolve(__dirname, '..'),
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  env: {
    CMS_SERVICE_URL: process.env.CMS_SERVICE_URL!,
    UPLOAD_SERVICE_URL: process.env.UPLOAD_SERVICE_URL!,
    APP_NAME: process.env.APP_NAME || 'Admin Panel',
    LOGO_URL: process.env.LOGO_URL || '/logo1.png',
    LOGO_ICON_URL: process.env.LOGO_ICON_URL || '/logo-icon.png',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'host.docker.internal',
        port: '9000',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
  reactCompiler: false,
  experimental: {
    optimizePackageImports: ['antd', '@ant-design/icons', 'lucide-react', 'dayjs', 'lodash-es'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts');
export default withNextIntl(nextConfig);

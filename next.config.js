/** @type {import('next').NextConfig} */
const { buildCspHeader } = require('@navikt/nav-dekoratoren-moduler/ssr');
const { version } = require('./package.json');

const appDirectives = {
  'connect-src': ["'self'", process.env.NEXT_PUBLIC_TELEMETRY_URL],
  'font-src': [],
  'script-src': [],
  'script-src-elem': ["'self'"],
  'style-src-elem': ["'self'"],
  'img-src': ["'self'", 'data:', 'blob:']
};

const nextConfig = {
  async headers() {
    const csp = await buildCspHeader(appDirectives, { env: process.env.ENVIRONMENT });

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, max-age=0, must-revalidate'
          }
        ]
      }
    ];
  },
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'standalone',
  basePath: '/im-dialog',
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true
  },
  // i18n: {
  //   locales: ['no'],
  //   defaultLocale: 'no'
  // },
  experimental: {
    optimizePackageImports: ['@navikt/aksel-icons'],
    turbopackFileSystemCacheForDev: true
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: version
  }
};

const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? require('@next/bundle-analyzer')({
        enabled: true,
        openAnalyzer: false
      })
    : (config) => config;

module.exports = withBundleAnalyzer(nextConfig);

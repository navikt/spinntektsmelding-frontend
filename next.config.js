/** @type {import('next').NextConfig} */
const { buildCspHeader } = require('@navikt/nav-dekoratoren-moduler/ssr');
const { version } = require('./package.json');

const appDirectives = {
  'connect-src': ["'self'", process.env.NEXT_PUBLIC_TELEMETRY_URL, 'https://www.nav.no'],
  'font-src': [],
  'script-src': ['https://www.nav.no'],
  'script-src-elem': ["'self'", 'https://www.nav.no'],
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
    optimizePackageImports: ['@navikt/aksel-icons', '@navikt/ds-react', 'date-fns', '@grafana/faro-web-sdk']
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: version
  },
  webpack: (config) => {
    const existingExternals = config.externals ?? [];
    config.externals = Array.isArray(existingExternals)
      ? [...existingExternals, 'canvas', 'jsdom']
      : [existingExternals, 'canvas', 'jsdom'];
    return config;
  }
  // modularizeImports: {
  //   '@navikt/ds-react': {
  //     transform: '@navikt/ds-react/esm/{{lowerCase member}}/index.js',
  //     skipDefaultConversion: true
  //   }
  // }
};

const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? require('@next/bundle-analyzer')({
        enabled: true,
        openAnalyzer: false
      })
    : (config) => config;

module.exports = withBundleAnalyzer(nextConfig);

/** @type {import('next').NextConfig} */
const { buildCspHeader } = require('@navikt/nav-dekoratoren-moduler/ssr');

const appDirectives = {
  'connect-src': ["'self'", 'https://*.uxsignals.com'],
  'font-src': ['https://fonts.gstatic.com'],
  'script-src': ['https://uxsignals-frontend.uxsignals.app.iterate.no', 'navtest.boost.ai'],
  'script-src-elem': ["'self'", 'navtest.boost.ai', 'https://uxsignals-frontend.uxsignals.app.iterate.no'],
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
  i18n: {
    locales: ['no'],
    defaultLocale: 'no'
  },
  serverRuntimeConfig: {
    decoratorEnv: 'dev',
    decoratorDisabled: process.env.DISABLE_DECORATOR
  },
  publicRuntimeConfig: {
    testStuff: process.env.TEST_STUFF,
    otherTestStuff: 'otherTestSuff',
    environment: process.env.ENVIRONMENT
  }
};

module.exports = nextConfig;

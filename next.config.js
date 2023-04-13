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
    decoratorEnv: process.env.DECORATOR_ENV,
    decoratorDisabled: process.env.DISABLE_DECORATOR,
    serverVar: process.env.SERVER_VAR
  },
  publicRuntimeConfig: {
    testStuff: process.env.NEXT_PUBLIC_TEST_STUFF,
    otherTestStuff: 'otherTestSuff',
    environment: process.env.ENVIRONMENT,
    innsendingInntektsmeldingApi: process.env.INNSENDING_INNTEKTSMELDING_API,
    inntektsmeldingKjenteDataApi: process.env.PREUTFYLT_INNTEKTSMELDING_API,
    tidligereInntekterApi: process.env.INNTEKTSDATA_API,
    logoutServiceUrl: process.env.LOGOUT_SERVICE_URL,
    loginServiceUrl: process.env.LOGIN_SERVICE_URL,
    arbeidsgiverListe: process.env.ARBEIDSGIVERLISTE_API,
    kvitteringDataApi: process.env.KVITTERINGSDATA_API
  }
};

module.exports = nextConfig;

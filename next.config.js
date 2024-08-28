/** @type {import('next').NextConfig} */
const { buildCspHeader } = require('@navikt/nav-dekoratoren-moduler/ssr');
const { version } = require('./package.json');

const appDirectives = {
  'connect-src': ["'self'", process.env.TELEMETRY_URL],
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
  serverRuntimeConfig: {
    decoratorEnv: process.env.DECORATOR_ENV,
    decoratorDisabled: process.env.DISABLE_DECORATOR,
    tokenXWellKnownUrl: process.env.TOKEN_X_WELL_KNOWN_URL,
    tokenXPrivateJwk: process.env.TOKEN_X_PRIVATE_JWK,
    tokenXClientId: process.env.TOKEN_X_CLIENT_ID,
    flexjarBackendClientId: process.env.FLEXJAR_BACKEND_CLIENT_ID,
    idportenWellKnownUrl: process.env.IDPORTEN_WELL_KNOWN_URL,
    idportenClientId: process.env.IDPORTEN_CLIENT_ID
  },
  publicRuntimeConfig: {
    environment: process.env.ENVIRONMENT,
    innsendingInntektsmeldingApi: process.env.INNSENDING_INNTEKTSMELDING_API,
    inntektsmeldingKjenteDataApi: process.env.PREUTFYLT_INNTEKTSMELDING_API,
    tidligereInntekterApi: process.env.INNTEKTSDATA_API,
    tidligereInntekterSelvbestemtApi: process.env.INNTEKTSDATA_SELVBESTEMT_API,
    logoutServiceUrl: process.env.LOGOUT_SERVICE_URL,
    loginServiceUrl: process.env.LOGIN_SERVICE_URL,
    arbeidsgiverListe: process.env.ARBEIDSGIVERLISTE_API,
    kvitteringDataApi: process.env.KVITTERINGSDATA_API,
    minSideArbeidsgiver: process.env.MIN_SIDE_ARBEIDSGIVER,
    saksoversiktUrl: process.env.SAKSOVERSIKT_URL,
    telemetryUrl: process.env.TELEMETRY_URL,
    flexJarUrl: process.env.FLEXJAR_URL,
    aktiveOrgnrApi: process.env.AKTIVE_ORGNR_API,
    innsendingSelvbestemtInntektsmeldingApi: process.env.INNSENDING_SELVBESTEMT_INNTEKTSMELDING_API,
    version,
    loggingDisabled: process.env.DISABLE_DECORATOR
  }
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */

const nextConfig = {
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
  }
};

module.exports = nextConfig;

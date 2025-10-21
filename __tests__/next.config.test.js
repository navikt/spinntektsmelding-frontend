import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the dekoratoren SSR module to control CSP output
vi.mock('@navikt/nav-dekoratoren-moduler/ssr', () => ({
  buildCspHeader: vi.fn(async () => 'mock-csp-header')
}));

const ORIGINAL_ENV = process.env;

// Helper to clear the Node require cache for next.config.js between tests
const clearNextConfigCache = () => {
  const key = require.resolve('../next.config.js');
  delete require.cache[key];
};

describe('next.config core config and headers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    clearNextConfigCache();
  });

  it('exposes expected core flags and runtime configs', () => {
    clearNextConfigCache();
    const config = require('../next.config.js');

    expect(config.poweredByHeader).toBe(false);
    expect(config.reactStrictMode).toBe(true);
    expect(config.output).toBe('standalone');
    expect(config.basePath).toBe('/im-dialog');

    // Experimental optimizePackageImports configured
    expect(config.experimental?.optimizePackageImports).toContain('@navikt/aksel-icons');
  });

  it('headers() returns CSP and cache-control headers using buildCspHeader', async () => {
    // const { buildCspHeader } = await vi.importMock('@navikt/nav-dekoratoren-moduler/ssr');
    process.env.ENVIRONMENT = 'dev-gcp';

    clearNextConfigCache();
    const config = require('../next.config.js');

    const headers = await config.headers();

    // Should return two header rules
    expect(Array.isArray(headers)).toBe(true);
    expect(headers).toHaveLength(2);

    // First rule: global CSP header
    const cspRule = headers[0];
    expect(cspRule.source).toBe('/:path*');
    // Ingen vits i å test det eksakte innholdet her, det er testet i dekoratoren
    expect(cspRule.headers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'Content-Security-Policy'
          // value: 'mock-csp-header'
        })
      ])
    );
    // If we wanted to test the exact value, we could do it like this:
    // expect(cspRule.headers).toEqual([
    //   {
    //     key: 'Content-Security-Policy',
    //     value:
    //       "connect-src 'self'  *.nav.no api.uxsignals.com *.boost.ai *.psplugin.com *.puzzel.com *.skyra.no *.taskanalytics.com; font-src *.psplugin.com *.skyra.no cdn.nav.no *.googleapis.com *.gstatic.com data:; script-src *.nav.no widget.uxsignals.com *.psplugin.com *.puzzel.com *.skyra.no *.taskanalytics.com nav.boost.ai 'unsafe-inline' 'unsafe-eval'; script-src-elem 'self' *.nav.no widget.uxsignals.com *.psplugin.com *.puzzel.com *.skyra.no *.taskanalytics.com nav.boost.ai 'unsafe-inline'; style-src-elem 'self' *.nav.no *.psplugin.com 'unsafe-inline' *.googleapis.com *.gstatic.com; img-src 'self' data: blob: *.nav.no widget.uxsignals.com *.psplugin.com *.vimeocdn.com *.skyra.no www.vergic.com; default-src *.nav.no; worker-src *.nav.no blob:; child-src *.nav.no blob:; style-src *.nav.no *.psplugin.com 'unsafe-inline' *.googleapis.com *.gstatic.com; frame-src player.vimeo.com video.qbrick.com *.nav.no; frame-ancestors 'self' *.psplugin.com;"
    //   }
    // ]);

    // Second rule: API cache-control header
    const apiRule = headers[1];
    expect(apiRule.source).toBe('/api/:path*');
    expect(apiRule.headers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'Cache-Control',
          value: 'private, no-cache, no-store, max-age=0, must-revalidate'
        })
      ])
    );
  });
});

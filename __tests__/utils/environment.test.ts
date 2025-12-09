import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import env from '../../config/environment';

describe('Environment', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original process.env
    process.env = originalEnv;
  });

  describe('loginServiceUrl', () => {
    it('should return login service URL with redirect placeholder', async () => {
      process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL = 'https://login.example.com';
      const { default: env } = await import('../../config/environment');
      expect(env.loginServiceUrl).toBe('https://login.example.com?redirect=XXX');
    });

    it('should handle undefined login service URL', async () => {
      delete process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL;
      const { default: env } = await import('../../config/environment');
      expect(env.loginServiceUrl).toBe('undefined?redirect=XXX');
    });

    it('should handle empty login service URL', async () => {
      process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL = '';
      const { default: env } = await import('../../config/environment');
      expect(env.loginServiceUrl).toBe('?redirect=XXX');
    });
  });

  describe('loginServiceUrlUtenRedirect', () => {
    it('should return login service URL without redirect', async () => {
      process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL = 'https://login.example.com';
      const { default: env } = await import('../../config/environment');
      expect(env.loginServiceUrlUtenRedirect).toBe('https://login.example.com');
    });

    it('should handle undefined login service URL', async () => {
      delete process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL;
      const { default: env } = await import('../../config/environment');
      expect(env.loginServiceUrlUtenRedirect).toBeUndefined();
    });
  });

  describe('logoutServiceUrl', () => {
    it('should return logout service URL', async () => {
      process.env.NEXT_PUBLIC_LOGOUT_SERVICE_URL = 'https://logout.example.com';
      const { default: env } = await import('../../config/environment');
      expect(env.logoutServiceUrl).toBe('https://logout.example.com');
    });

    it('should handle undefined logout service URL', async () => {
      delete process.env.NEXT_PUBLIC_LOGOUT_SERVICE_URL;
      const { default: env } = await import('../../config/environment');
      expect(env.logoutServiceUrl).toBeUndefined();
    });
  });

  describe('minSideArbeidsgiver', () => {
    it('should return min side arbeidsgiver URL', async () => {
      process.env.NEXT_PUBLIC_MIN_SIDE_ARBEIDSGIVER = 'https://arbeidsgiver.example.com';
      const { default: env } = await import('../../config/environment');
      expect(env.minSideArbeidsgiver).toBe('https://arbeidsgiver.example.com');
    });

    it('should handle undefined min side arbeidsgiver', () => {
      delete process.env.NEXT_PUBLIC_MIN_SIDE_ARBEIDSGIVER;
      expect(env.minSideArbeidsgiver).toBeUndefined();
    });
  });

  describe('saksoversiktUrl', () => {
    it('should return saksoversikt URL', async () => {
      process.env.NEXT_PUBLIC_SAKSOVERSIKT_URL = 'https://saker.example.com';
      const { default: env } = await import('../../config/environment');
      expect(env.saksoversiktUrl).toBe('https://saker.example.com');
    });

    it('should handle undefined saksoversikt URL', () => {
      delete process.env.NEXT_PUBLIC_SAKSOVERSIKT_URL;
      expect(env.saksoversiktUrl).toBeUndefined();
    });
  });

  describe('telemetryUrl', () => {
    it('should return telemetry URL', async () => {
      process.env.NEXT_PUBLIC_TELEMETRY_URL = 'https://telemetry.example.com';
      const { default: env } = await import('../../config/environment');
      expect(env.telemetryUrl).toBe('https://telemetry.example.com');
    });

    it('should handle undefined telemetry URL', async () => {
      delete process.env.NEXT_PUBLIC_TELEMETRY_URL;
      const { default: env } = await import('../../config/environment');
      expect(env.telemetryUrl).toBeUndefined();
    });
  });

  describe('Static properties', () => {
    it('should have correct baseUrl', () => {
      expect(env.baseUrl).toBe('/im-dialog');
    });

    it('should have correct skjemadataUrl', () => {
      expect(env.skjemadataUrl).toBe('/im-dialog/api/hent-forespoersel');
    });

    it('should have correct inntektsdataUrl', () => {
      expect(env.inntektsdataUrl).toBe('/im-dialog/api/inntektsdata');
    });

    it('should have correct inntektsdataSelvbestemtUrl', () => {
      expect(env.inntektsdataSelvbestemtUrl).toBe('/im-dialog/api/inntekt-selvbestemt');
    });

    it('should have correct innsendingUrl', () => {
      expect(env.innsendingUrl).toBe('/im-dialog/api/innsendingInntektsmelding');
    });

    it('should have correct flexjarUrl', () => {
      expect(env.flexjarUrl).toBe('/im-dialog/api/flexjar-backend');
    });

    it('should have correct hentKvitteringUrl', () => {
      expect(env.hentKvitteringUrl).toBe('/im-dialog/api/hentKvittering');
    });

    it('should have correct hentArbeidsgivereUrl', () => {
      expect(env.hentArbeidsgivereUrl).toBe('/im-dialog/api/arbeidsgivere');
    });

    it('should have correct initierBlankSkjemaUrl', () => {
      expect(env.initierBlankSkjemaUrl).toBe('/im-dialog/api/aktiveorgnr');
    });

    it('should have amplitudeEnabled set to true', () => {
      expect(env.amplitudeEnabled).toBe(true);
    });

    it('should have correct innsendingAGInitiertUrl', () => {
      expect(env.innsendingAGInitiertUrl).toBe('/im-dialog/api/selvbestemt-inntektsmelding');
    });

    it('should have correct hentSykepengesoknaderUrl', () => {
      expect(env.hentSykepengesoknaderUrl).toBe('/im-dialog/api/sp-soeknader');
    });

    it('should have correct hentBehandlingsdagerUrl', () => {
      expect(env.hentBehandlingsdagerUrl).toBe('/im-dialog/api/sp-behandlingsdager');
    });

    it('should have correct mineTilgangerUrl', () => {
      expect(env.mineTilgangerUrl).toBe('/im-dialog/api/mine-tilganger');
    });
  });

  describe('Getter consistency', () => {
    it('should return consistent values on multiple calls', () => {
      process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL = 'https://login.example.com';

      const first = env.loginServiceUrl;
      const second = env.loginServiceUrl;
      const third = env.loginServiceUrl;

      expect(first).toBe(second);
      expect(second).toBe(third);
    });
  });

  describe('version', () => {
    it('should return version from environment variable', async () => {
      process.env.NEXT_PUBLIC_APP_VERSION = '1.2.3';
      const { default: env } = await import('../../config/environment');
      expect(env.version).toBe('1.2.3');
    });

    it('should handle undefined version', () => {
      delete process.env.NEXT_PUBLIC_APP_VERSION;
      expect(env.version).toBeUndefined();
    });

    it('should handle prerelease version', async () => {
      process.env.NEXT_PUBLIC_APP_VERSION = '1.0.0-beta.1';
      const { default: env } = await import('../../config/environment');
      expect(env.version).toBe('1.0.0-beta.1');
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in URLs', async () => {
      process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL = 'https://login.example.com?param=value&other=test';
      const { default: env } = await import('../../config/environment');
      expect(env.loginServiceUrl).toBe('https://login.example.com?param=value&other=test?redirect=XXX');
    });

    it('should handle URLs with trailing slash', async () => {
      process.env.NEXT_PUBLIC_LOGOUT_SERVICE_URL = 'https://logout.example.com/';
      const { default: env } = await import('../../config/environment');
      expect(env.logoutServiceUrl).toBe('https://logout.example.com/');
    });

    it('should handle empty string environment variables', async () => {
      process.env.NEXT_PUBLIC_TELEMETRY_URL = '';
      const { default: env } = await import('../../config/environment');
      expect(env.telemetryUrl).toBe('');
    });
  });

  describe('Multiple getters interaction', () => {
    it('should handle multiple environment variables set at once', async () => {
      process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL = 'https://login.example.com';
      process.env.NEXT_PUBLIC_LOGOUT_SERVICE_URL = 'https://logout.example.com';
      const { default: env } = await import('../../config/environment');
      expect(env.loginServiceUrl).toBe('https://login.example.com?redirect=XXX');
      expect(env.logoutServiceUrl).toBe('https://logout.example.com');
    });
  });
});

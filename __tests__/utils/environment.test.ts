import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import env from '../../config/environment';
import { version } from '../../package.json';

describe('Environment', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original process.env
    process.env = originalEnv;
  });

  describe('loginServiceUrl', () => {
    it('should return login service URL with redirect placeholder', () => {
      process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL = 'https://login.example.com';
      expect(env.loginServiceUrl).toBe('https://login.example.com?redirect=XXX');
    });

    it('should handle undefined login service URL', () => {
      delete process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL;
      expect(env.loginServiceUrl).toBe('undefined?redirect=XXX');
    });

    it('should handle empty login service URL', () => {
      process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL = '';
      expect(env.loginServiceUrl).toBe('?redirect=XXX');
    });
  });

  describe('loginServiceUrlUtenRedirect', () => {
    it('should return login service URL without redirect', () => {
      process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL = 'https://login.example.com';
      expect(env.loginServiceUrlUtenRedirect).toBe('https://login.example.com');
    });

    it('should handle undefined login service URL', () => {
      delete process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL;
      expect(env.loginServiceUrlUtenRedirect).toBeUndefined();
    });
  });

  describe('logoutServiceUrl', () => {
    it('should return logout service URL', () => {
      process.env.NEXT_PUBLIC_LOGOUT_SERVICE_URL = 'https://logout.example.com';
      expect(env.logoutServiceUrl).toBe('https://logout.example.com');
    });

    it('should handle undefined logout service URL', () => {
      delete process.env.NEXT_PUBLIC_LOGOUT_SERVICE_URL;
      expect(env.logoutServiceUrl).toBeUndefined();
    });
  });

  describe('innsendingInntektsmeldingAPI', () => {
    it('should return innsending inntektsmelding API URL', () => {
      process.env.NEXT_PUBLIC_INNSENDING_INNTEKTSMELDING_API = 'https://api.example.com/innsending';
      expect(env.innsendingInntektsmeldingAPI).toBe('https://api.example.com/innsending');
    });

    it('should handle undefined innsending API', () => {
      delete process.env.NEXT_PUBLIC_INNSENDING_INNTEKTSMELDING_API;
      expect(env.innsendingInntektsmeldingAPI).toBeUndefined();
    });
  });

  describe('inntektsmeldingUuidAPI', () => {
    it('should return preutfylt inntektsmelding API URL', () => {
      process.env.NEXT_PUBLIC_PREUTFYLT_INNTEKTSMELDING_API = 'https://api.example.com/preutfylt';
      expect(env.inntektsmeldingUuidAPI).toBe('https://api.example.com/preutfylt');
    });

    it('should handle undefined preutfylt API', () => {
      delete process.env.NEXT_PUBLIC_PREUTFYLT_INNTEKTSMELDING_API;
      expect(env.inntektsmeldingUuidAPI).toBeUndefined();
    });
  });

  describe('inntektsdataAPI', () => {
    it('should return inntektsdata API URL', () => {
      process.env.NEXT_PUBLIC_INNTEKTSDATA_API = 'https://api.example.com/inntektsdata';
      expect(env.inntektsdataAPI).toBe('https://api.example.com/inntektsdata');
    });

    it('should handle undefined inntektsdata API', () => {
      delete process.env.NEXT_PUBLIC_INNTEKTSDATA_API;
      expect(env.inntektsdataAPI).toBeUndefined();
    });
  });

  describe('inntektsdataSelvbestemtAPI', () => {
    it('should return selvbestemt inntektsdata API URL', () => {
      process.env.NEXT_PUBLIC_INNTEKTSDATA_SELVBESTEMT_API = 'https://api.example.com/selvbestemt';
      expect(env.inntektsdataSelvbestemtAPI).toBe('https://api.example.com/selvbestemt');
    });

    it('should handle undefined selvbestemt API', () => {
      delete process.env.NEXT_PUBLIC_INNTEKTSDATA_SELVBESTEMT_API;
      expect(env.inntektsdataSelvbestemtAPI).toBeUndefined();
    });
  });

  describe('hentKvitteringAPI', () => {
    it('should return kvittering API URL', () => {
      process.env.NEXT_PUBLIC_KVITTERINGDATA_API = 'https://api.example.com/kvittering';
      expect(env.hentKvitteringAPI).toBe('https://api.example.com/kvittering');
    });

    it('should handle undefined kvittering API', () => {
      delete process.env.NEXT_PUBLIC_KVITTERINGDATA_API;
      expect(env.hentKvitteringAPI).toBeUndefined();
    });
  });

  describe('minSideArbeidsgiver', () => {
    it('should return min side arbeidsgiver URL', () => {
      process.env.NEXT_PUBLIC_MIN_SIDE_ARBEIDSGIVER = 'https://arbeidsgiver.example.com';
      expect(env.minSideArbeidsgiver).toBe('https://arbeidsgiver.example.com');
    });

    it('should handle undefined min side arbeidsgiver', () => {
      delete process.env.NEXT_PUBLIC_MIN_SIDE_ARBEIDSGIVER;
      expect(env.minSideArbeidsgiver).toBeUndefined();
    });
  });

  describe('saksoversiktUrl', () => {
    it('should return saksoversikt URL', () => {
      process.env.NEXT_PUBLIC_SAKSOVERSIKT_URL = 'https://saker.example.com';
      expect(env.saksoversiktUrl).toBe('https://saker.example.com');
    });

    it('should handle undefined saksoversikt URL', () => {
      delete process.env.NEXT_PUBLIC_SAKSOVERSIKT_URL;
      expect(env.saksoversiktUrl).toBeUndefined();
    });
  });

  describe('aktiveOrgnrApi', () => {
    it('should return aktive orgnr API URL', () => {
      process.env.NEXT_PUBLIC_AKTIVE_ORGNR_API = 'https://api.example.com/orgnr';
      expect(env.aktiveOrgnrApi).toBe('https://api.example.com/orgnr');
    });

    it('should handle undefined aktive orgnr API', () => {
      delete process.env.NEXT_PUBLIC_AKTIVE_ORGNR_API;
      expect(env.aktiveOrgnrApi).toBeUndefined();
    });
  });

  describe('telemetryUrl', () => {
    it('should return telemetry URL', () => {
      process.env.NEXT_PUBLIC_TELEMETRY_URL = 'https://telemetry.example.com';
      expect(env.telemetryUrl).toBe('https://telemetry.example.com');
    });

    it('should handle undefined telemetry URL', () => {
      delete process.env.NEXT_PUBLIC_TELEMETRY_URL;
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

  describe('version', () => {
    it('should return version from package.json', () => {
      expect(env.version).toBe(version);
    });

    it('should be a valid semver string', () => {
      expect(env.version).toMatch(/^\d+\.\d+\.\d+/);
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in URLs', () => {
      process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL = 'https://login.example.com?param=value&other=test';
      expect(env.loginServiceUrl).toBe('https://login.example.com?param=value&other=test?redirect=XXX');
    });

    it('should handle URLs with trailing slash', () => {
      process.env.NEXT_PUBLIC_LOGOUT_SERVICE_URL = 'https://logout.example.com/';
      expect(env.logoutServiceUrl).toBe('https://logout.example.com/');
    });

    it('should handle empty string environment variables', () => {
      process.env.NEXT_PUBLIC_TELEMETRY_URL = '';
      expect(env.telemetryUrl).toBe('');
    });
  });

  describe('Multiple getters interaction', () => {
    it('should handle multiple environment variables set at once', () => {
      process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL = 'https://login.example.com';
      process.env.NEXT_PUBLIC_LOGOUT_SERVICE_URL = 'https://logout.example.com';

      expect(env.loginServiceUrl).toBe('https://login.example.com?redirect=XXX');
      expect(env.logoutServiceUrl).toBe('https://logout.example.com');
    });
  });
});

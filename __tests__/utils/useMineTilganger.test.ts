import { describe, it, expect, vi, beforeEach } from 'vitest';
import useSWRImmutable from 'swr/immutable';
import useMineTilganger from '../../utils/useMineTilganger';
import fetcherArbeidsgiverListe from '../../utils/fetcherArbeidsgiverListe';
import { commonSWRFormOptions } from '../../utils/commonSWRFormOptions';
import { buildSWRFormErrorHandler } from '../../utils/buildSWRFormErrorHandler';
import { redirectToLogin } from '../../utils/redirectToLogin';

// Shared test state
const envUrl = vi.hoisted(() => 'https://example.test/mine-tilganger');
let lastUseSWRArgs: any;
let swrReturnValue: any;
let onErrorSpy: any;
let lastErrorHandlerConfig: any;

// Mocks
vi.mock('swr/immutable', () => ({
  default: vi.fn((key: any, fetcher: any, options: any) => {
    lastUseSWRArgs = { key, fetcher, options };
    return swrReturnValue;
  })
}));

vi.mock('../../config/environment', () => ({
  default: { mineTilgangerUrl: envUrl }
}));

vi.mock('../../utils/fetcherArbeidsgiverListe', () => ({
  default: vi.fn(async (url: string) => ({ ok: true, url }))
}));

vi.mock('../../utils/commonSWRFormOptions', () => ({
  commonSWRFormOptions: { revalidateIfStale: false, revalidateOnFocus: false }
}));

vi.mock('../../utils/redirectToLogin', () => ({
  redirectToLogin: vi.fn()
}));

vi.mock('../../utils/buildSWRFormErrorHandler', () => ({
  buildSWRFormErrorHandler: vi.fn((config: any) => {
    lastErrorHandlerConfig = config;
    return onErrorSpy;
  })
}));

// Imports after mocks

describe('useMineTilganger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastUseSWRArgs = undefined;
    lastErrorHandlerConfig = undefined;
    swrReturnValue = { data: 'SWR_RESULT' };
    onErrorSpy = vi.fn();
  });

  it('calls SWR with correct key, fetcher, and options and returns SWR result', async () => {
    const setError = vi.fn();

    const result = useMineTilganger(setError);

    expect(result).toBe(swrReturnValue);
    expect(useSWRImmutable as any).toHaveBeenCalledTimes(1);

    // Key
    expect(lastUseSWRArgs.key).toEqual([envUrl]);

    // Fetcher forwards url to fetcherArbeidsgiverListe
    expect(typeof lastUseSWRArgs.fetcher).toBe('function');
    await lastUseSWRArgs.fetcher([envUrl]);
    expect(fetcherArbeidsgiverListe).toHaveBeenCalledWith(envUrl);

    // Options merged and onError wired
    expect(lastUseSWRArgs.options.onError).toBe(onErrorSpy);
    expect(lastUseSWRArgs.options).toMatchObject(commonSWRFormOptions);
  });

  it('builds error handler with proper config and redirects on unauthorized', () => {
    const setError = vi.fn();

    useMineTilganger(setError);

    expect(buildSWRFormErrorHandler).toHaveBeenCalledTimes(1);
    const cfg = lastErrorHandlerConfig;
    expect(cfg.setError).toBe(setError);
    expect(cfg.field).toBe('arbeidsgiverListe');
    expect(cfg.messages).toEqual({
      unauthorized: 'Mangler tilgang til den aktuelle organisasjonen',
      notFound: 'Kunne ikke finne arbeidsforhold for personen, sjekk at du har tastet riktig fødselsnummer',
      default: 'Kunne ikke hente arbeidsforhold'
    });

    // onUnauthorized triggers redirect to login
    cfg.onUnauthorized(new Error('401'));
    expect(redirectToLogin).toHaveBeenCalledWith('/initiering');
  });
});

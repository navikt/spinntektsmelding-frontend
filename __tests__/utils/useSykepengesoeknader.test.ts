import { describe, it, expect, vi, beforeEach } from 'vitest';
import useSWRImmutable from 'swr/immutable';
import useSykepengesoeknader from '../../utils/useSykepengesoeknader';
import fetcherSykepengesoeknader from '../../utils/fetcherSykepengesoeknader';
import { commonSWRFormOptions } from '../../utils/commonSWRFormOptions';
import { buildSWRFormErrorHandler } from '../../utils/buildSWRFormErrorHandler';
import { redirectToLogin } from '../../utils/redirectToLogin';
import testFnr from '../../mockdata/testFnr';
import testOrganisasjoner from '../../mockdata/testOrganisasjoner';

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
  default: { hentSykepengesoknaderUrl: envUrl }
}));

vi.mock('../../utils/fetcherSykepengesoeknader', () => ({
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

describe('useSykepengesoeknader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastUseSWRArgs = undefined;
    lastErrorHandlerConfig = undefined;
    swrReturnValue = { data: 'SWR_RESULT' };
    onErrorSpy = vi.fn();
  });

  it('calls SWR with correct key, fetcher, and options and returns SWR result', async () => {
    const setError = vi.fn();

    const result = useSykepengesoeknader(
      testFnr.GyldigeFraDolly.TestPerson1,
      testOrganisasjoner[0].organizationNumber,
      setError
    );

    expect(result).toBe(swrReturnValue);
    expect(useSWRImmutable as any).toHaveBeenCalledTimes(1);

    // Key
    expect(lastUseSWRArgs.key).toEqual([
      envUrl,
      testFnr.GyldigeFraDolly.TestPerson1,
      testOrganisasjoner[0].organizationNumber
    ]);

    // Fetcher forwards url to fetcherSykepengesoeknader
    expect(typeof lastUseSWRArgs.fetcher).toBe('function');
    await lastUseSWRArgs.fetcher([
      envUrl,
      testFnr.GyldigeFraDolly.TestPerson1,
      testOrganisasjoner[0].organizationNumber
    ]);
    expect(fetcherSykepengesoeknader).toHaveBeenCalledWith(
      'https://example.test/mine-tilganger',
      '25087327879',
      '810007672'
    );

    // Options merged and onError wired
    expect(lastUseSWRArgs.options.onError).toBe(onErrorSpy);
    expect(lastUseSWRArgs.options).toMatchObject(commonSWRFormOptions);
  });

  it('builds error handler with proper config and redirects on unauthorized', () => {
    const setError = vi.fn();

    useSykepengesoeknader(testFnr.GyldigeFraDolly.TestPerson1, testOrganisasjoner[0].organizationNumber, setError);

    expect(buildSWRFormErrorHandler).toHaveBeenCalledTimes(1);
    const cfg = lastErrorHandlerConfig;
    expect(cfg.setError).toBe(setError);
    expect(cfg.field).toBe('sykepengePeriodeId');
    expect(cfg.messages).toEqual({
      unauthorized: 'Mangler tilgang til den aktuelle organisasjonen',
      notFound: 'Kunne ikke finne arbeidsforhold for personen, sjekk at du har tastet riktig fødselsnummer',
      default: 'Kunne ikke hente sykepengesøknader'
    });
  });

  it('always provides an onError function when setError is not provided', () => {
    useSykepengesoeknader(testFnr.GyldigeFraDolly.TestPerson1, testOrganisasjoner[0].organizationNumber, undefined);

    expect(lastUseSWRArgs.options.onError).toEqual(expect.any(Function));
    expect(buildSWRFormErrorHandler).not.toHaveBeenCalled();
  });
});

// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import useSykepengesoeknader from '../../utils/useSykepengesoeknader';

// const envUrl = vi.hoisted(() => 'https://api.example/hentSykepengesoknader');
// let lastErrorHandlerConfig: any;
// let capturedArgs: { key: any; fetcher: any; options: any } | undefined;

// vi.mock('swr/immutable', () => {
//   const mock = vi.fn((key: any, fetcher: any, options: any) => {
//     capturedArgs = { key, fetcher, options };
//     return { data: 'swrReturn' };
//   });
//   return { default: mock };
// });

// vi.mock('../../config/environment', () => ({
//   default: { hentSykepengesoknaderUrl: envUrl }
// }));

// const fetcherMock = vi.fn();
// vi.mock('../../config/fetcherSykepengesoeknader', () => ({
//   default: (...args: any[]) => fetcherMock(...args)
// }));

// const commonOptions = { revalidateOnFocus: false, keepPreviousData: true, marker: 'marker' };
// vi.mock('../../config/commonSWRFormOptions', () => ({
//   commonSWRFormOptions: commonOptions
// }));

// const onErrorSpy = vi.fn();
// vi.mock('../../config/buildSWRFormErrorHandler', () => ({
//   buildSWRFormErrorHandler: vi.fn((config: any) => {
//     lastErrorHandlerConfig = config;
//     return onErrorSpy;
//   })
// }));

// describe('useSykepengesoeknader', () => {
//   beforeEach(() => {
//     capturedArgs = undefined;
//     fetcherMock.mockReset();
//     onErrorSpy.mockReset();
//     lastErrorHandlerConfig = undefined;
//   });

//   it('calls useSWRImmutable with correct key and merged options', () => {
//     const setError = vi.fn();
//     const result = useSykepengesoeknader('12345678901', '999888777', '2023-01-01', setError);

//     expect(result).toEqual({ data: 'swrReturn' });
//     expect(capturedArgs).toBeTruthy();
//     expect(capturedArgs?.key).toEqual([envUrl, '12345678901', '999888777', '2023-01-01']);

//     expect(lastErrorHandlerConfig).toEqual({
//       setError,
//       field: 'sykepengePeriodeId',
//       messages: {
//         unauthorized: 'Mangler tilgang til den aktuelle organisasjonen',
//         notFound: 'Kunne ikke finne arbeidsforhold for personen, sjekk at du har tastet riktig fødselsnummer',
//         default: 'Kunne ikke hente sykepengesøknader'
//       }
//     });
//     expect(capturedArgs?.options.onError).toBe(onErrorSpy);
//     // spread options present
//     expect(capturedArgs?.options).toMatchObject(commonOptions);
//   });

//   it('fetcher passes through URL when all params are truthy', async () => {
//     useSykepengesoeknader('123', '456', '2023-01-01', vi.fn());
//     expect(capturedArgs?.fetcher).toBeTypeOf('function');

//     fetcherMock.mockResolvedValueOnce('ok');
//     await capturedArgs!.fetcher([envUrl, '123', '456', '2023-01-01']);
//     expect(fetcherMock).toHaveBeenCalledWith(envUrl, '123', '456', '2023-01-01');
//   });

//   it('fetcher passes null URL when a param is falsy', async () => {
//     useSykepengesoeknader(undefined, '456', '2023-01-01', vi.fn());
//     expect(capturedArgs?.fetcher).toBeTypeOf('function');

//     fetcherMock.mockResolvedValueOnce('ok');
//     await capturedArgs!.fetcher([envUrl, undefined, '456', '2023-01-01'] as any);
//     expect(fetcherMock).toHaveBeenCalledWith(null, undefined, '456', '2023-01-01');

//     fetcherMock.mockResolvedValueOnce('ok');
//     await capturedArgs!.fetcher([envUrl, '123', '', '2023-01-01']);
//     expect(fetcherMock).toHaveBeenCalledWith(null, '123', '', '2023-01-01');
//   });

//   it('exposes the built onError handler', () => {
//     useSykepengesoeknader('123', '456', '2023-01-01', vi.fn());
//     const err = new Error('boom');
//     capturedArgs!.options.onError(err);
//     expect(onErrorSpy).toHaveBeenCalledWith(err);
//   });
// });

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
      '2023-01-01',
      setError
    );

    expect(result).toBe(swrReturnValue);
    expect(useSWRImmutable as any).toHaveBeenCalledTimes(1);

    // Key
    expect(lastUseSWRArgs.key).toEqual([
      envUrl,
      testFnr.GyldigeFraDolly.TestPerson1,
      testOrganisasjoner[0].organizationNumber,
      '2023-01-01'
    ]);

    // Fetcher forwards url to fetcherSykepengesoeknader
    expect(typeof lastUseSWRArgs.fetcher).toBe('function');
    await lastUseSWRArgs.fetcher([
      envUrl,
      testFnr.GyldigeFraDolly.TestPerson1,
      testOrganisasjoner[0].organizationNumber,
      '2023-01-01'
    ]);
    expect(fetcherSykepengesoeknader).toHaveBeenCalledWith(
      'https://example.test/mine-tilganger',
      '25087327879',
      '810007672',
      '2023-01-01'
    );

    // Options merged and onError wired
    expect(lastUseSWRArgs.options.onError).toBe(onErrorSpy);
    expect(lastUseSWRArgs.options).toMatchObject(commonSWRFormOptions);
  });

  it('builds error handler with proper config and redirects on unauthorized', () => {
    const setError = vi.fn();

    useSykepengesoeknader(
      testFnr.GyldigeFraDolly.TestPerson1,
      testOrganisasjoner[0].organizationNumber,
      '2023-01-01',
      setError
    );

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
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import useArbeidsforhold from '../../utils/useArbeidsforhold';
import fetcherArbeidsforhold from '../../utils/fetcherArbeidsforhold';
import { buildSWRFormErrorHandler } from '../../utils/buildSWRFormErrorHandler';
import { redirectToLogin } from '../../utils/redirectToLogin';
import { commonSWRFormOptions } from '../../utils/commonSWRFormOptions';

const hoisted = vi.hoisted(() => ({
  // Capture arguments passed to useSWRImmutable
  capturedKey: undefined as any,
  capturedFetcher: undefined as any,
  capturedOptions: undefined as any,
  // onError function returned by buildSWRFormErrorHandler
  builtOnError: vi.fn()
}));

vi.mock('swr/immutable', () => {
  return {
    default: vi.fn((key: any, fetcher: any, options: any) => {
      hoisted.capturedKey = key;
      hoisted.capturedFetcher = fetcher;
      hoisted.capturedOptions = options;
      return { data: undefined, error: undefined, isLoading: false };
    })
  };
});

vi.mock('../../config/environment', () => {
  return {
    default: {
      initierBlankSkjemaUrl: 'INIT_URL'
    }
  };
});

vi.mock('../../utils/fetcherArbeidsforhold', () => {
  return {
    default: vi.fn()
  };
});

vi.mock('../../utils/commonSWRFormOptions', () => {
  return {
    commonSWRFormOptions: {
      revalidateOnFocus: false,
      dedupingInterval: 111
    }
  };
});

vi.mock('../../utils/buildSWRFormErrorHandler', () => {
  return {
    buildSWRFormErrorHandler: vi.fn(() => hoisted.builtOnError)
  };
});

vi.mock('../../utils/redirectToLogin', () => {
  return {
    redirectToLogin: vi.fn()
  };
});

describe('useArbeidsforhold', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.capturedKey = undefined;
    hoisted.capturedFetcher = undefined;
    hoisted.capturedOptions = undefined;
    hoisted.builtOnError = vi.fn();
  });

  it('calls useSWRImmutable with key [INIT_URL, identitetsnummer] and spreads common options', () => {
    const setError = vi.fn();

    useArbeidsforhold('123', setError);

    expect(hoisted.capturedKey).toEqual(['INIT_URL', '123']);

    // onError should be the function returned by buildSWRFormErrorHandler
    expect(hoisted.capturedOptions.onError).toBe(hoisted.builtOnError);

    // commonSWRFormOptions should be spread into options
    for (const [k, v] of Object.entries(commonSWRFormOptions)) {
      expect(hoisted.capturedOptions[k as keyof typeof hoisted.capturedOptions]).toEqual(v);
    }

    // buildSWRFormErrorHandler should be called with the expected config
    expect(buildSWRFormErrorHandler).toHaveBeenCalledTimes(1);
    const cfg = (buildSWRFormErrorHandler as Mock).mock.calls[0][0];

    expect(cfg.setError).toBe(setError);
    expect(cfg.field).toBe('arbeidsgiverListe');
    expect(cfg.messages).toEqual({
      unauthorized: 'Mangler tilgang til den aktuelle organisasjonen',
      notFound: 'Kunne ikke finne arbeidsforhold for personen, sjekk at du har tastet riktig fødselsnummer',
      default: 'Kunne ikke hente arbeidsforhold'
    });
    expect(typeof cfg.onUnauthorized).toBe('function');

    // Verify onUnauthorized triggers redirectToLogin('/initiering')
    cfg.onUnauthorized(new Error('unauthorized'));
    expect(redirectToLogin).toHaveBeenCalledWith('/initiering');
  });

  it('fetcher calls fetcherArbeidsforhold with (url, identitetsnummer) when identitetsnummer is provided', async () => {
    const setError = vi.fn();

    useArbeidsforhold('123', setError);

    // Simulate SWR calling the fetcher with the tuple as a single param (as used by the hook)
    await hoisted.capturedFetcher(['INIT_URL', '123']);

    expect(fetcherArbeidsforhold).toHaveBeenCalledWith('INIT_URL', '123');
  });

  it('fetcher calls fetcherArbeidsforhold with (null, undefined) when identitetsnummer is undefined', async () => {
    const setError = vi.fn();

    useArbeidsforhold(undefined, setError);

    expect(hoisted.capturedKey).toEqual(['INIT_URL', undefined]);

    await hoisted.capturedFetcher(['INIT_URL', undefined]);

    expect(fetcherArbeidsforhold).toHaveBeenCalledWith(null, undefined);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import useSWRImmutable from 'swr/immutable';
import environment from '../../config/environment';
import useBehandlingsdager from '../../utils/useBehandlingsdager';
import fetcherSykepengesoeknader from '../../utils/fetcherSykepengesoeknader';

vi.mock('swr/immutable', () => ({
  __esModule: true,
  default: vi.fn()
}));

vi.mock('../../utils/fetcherSykepengesoeknader', () => ({
  __esModule: true,
  default: vi.fn()
}));

describe('useBehandlingsdager', () => {
  const TEST_URL = 'http://test-url';
  const ident = '123';
  const org = '456';
  const fom = '2021-01-01';
  let setError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    environment.hentBehandlingsdagerUrl = TEST_URL;
    setError = vi.fn();
    // call the hook to record the useSWRImmutable call
    useBehandlingsdager(ident, org, fom, setError);
  });

  it('calls useSWRImmutable with correct key, fetcher and config', () => {
    expect(useSWRImmutable).toHaveBeenCalledTimes(1);
    const [key, fetcher, config] = (useSWRImmutable as any).mock.calls[0];
    expect(key).toEqual([TEST_URL, ident, org, fom]);
    expect(typeof fetcher).toBe('function');
    expect(config.refreshInterval).toBe(0);
    expect(config.shouldRetryOnError).toBe(false);
    expect(typeof config.onError).toBe('function');
  });

  it('fetcher invokes fetcherSykepengesoeknader with URL when all params truthy', () => {
    const fetcher = (useSWRImmutable as any).mock.calls[0][1];
    fetcher([TEST_URL, ident, org, fom]);
    expect(fetcherSykepengesoeknader).toHaveBeenCalledWith(TEST_URL, ident, org, fom);
  });

  it('fetcher invokes fetcherSykepengesoeknader with null URL when ident is undefined', () => {
    useBehandlingsdager(undefined, org, fom, setError);
    const fetcher = (useSWRImmutable as any).mock.calls[1][1];
    fetcher([TEST_URL, undefined, org, fom]);
    expect(fetcherSykepengesoeknader).toHaveBeenCalledWith(null, undefined, org, fom);
  });

  describe('onError handler', () => {
    let onError: (err: any) => void;
    beforeEach(() => {
      onError = (useSWRImmutable as any).mock.calls[0][2].onError;
    });

    it('handles 401 status', () => {
      onError({ status: 401 });
      expect(setError).toHaveBeenCalledWith('sykepengerBehandlingsdager', {
        type: 'manual',
        error: 'Mangler tilgang til den aktuelle organisasjonen'
      });
    });

    it('handles 404 status', () => {
      onError({ status: 404 });
      expect(setError).toHaveBeenCalledWith('sykepengerBehandlingsdager', {
        type: 'manual',
        error: 'Kunne ikke finne arbeidsforhold for personen, sjekk at du har tastet riktig fødselsnummer'
      });
    });

    it('handles other non-200 status', () => {
      onError({ status: 500 });
      expect(setError).toHaveBeenCalledWith('sykepengerBehandlingsdager', {
        type: 'manual',
        error: 'Kunne ikke hente sykepengesøknader'
      });
    });

    it('does not call setError for status 200', () => {
      onError({ status: 200 });
      expect(setError).not.toHaveBeenCalled();
    });
  });
});

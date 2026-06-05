import { beforeEach, describe, expect, it, vi } from 'vitest';
import hentArbeidsforholdSSR from '../../utils/hentArbeidsforholdSSR';
import fetchDataSSR from '../../utils/fetchDataSSR';

vi.mock('../../utils/fetchDataSSR');
vi.mock('@navikt/next-logger', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}));

describe('hentArbeidsforholdSSR', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.IM_API_URI = 'api-host';
    process.env.ARBEIDSFORHOLD_API = '/api/arbeidsforhold';
  });

  it('throws when pathSlug is an array', async () => {
    await expect(hentArbeidsforholdSSR(['a', 'b'], 'token')).rejects.toThrow(
      'Ugyldig pathSlug: må være en streng, ikke en array'
    );
    expect(fetchDataSSR).not.toHaveBeenCalled();
  });

  it('throws when pathSlug is undefined', async () => {
    await expect(hentArbeidsforholdSSR(undefined, 'token')).rejects.toThrow(
      'Ugyldig pathSlug: må være en streng, ikke en array'
    );
    expect(fetchDataSSR).not.toHaveBeenCalled();
  });

  it('throws when pathSlug is an empty string', async () => {
    await expect(hentArbeidsforholdSSR('', 'token')).rejects.toThrow(
      'Ugyldig pathSlug: må være en streng, ikke en array'
    );
    expect(fetchDataSSR).not.toHaveBeenCalled();
  });

  it('delegates to fetchDataSSR with token', async () => {
    const mockData = { ansettelsesforhold: [] };
    vi.mocked(fetchDataSSR).mockResolvedValue(mockData as never);

    const result = await hentArbeidsforholdSSR('test-slug', 'test-token');

    expect(fetchDataSSR).toHaveBeenCalledWith('http://api-host/api/arbeidsforhold', 'test-slug', 'test-token');
    expect(result).toEqual(mockData);
  });

  it('delegates to fetchDataSSR without token', async () => {
    const mockData = { ansettelsesforhold: [] };
    vi.mocked(fetchDataSSR).mockResolvedValue(mockData as never);

    const result = await hentArbeidsforholdSSR('test-slug');

    expect(fetchDataSSR).toHaveBeenCalledWith('http://api-host/api/arbeidsforhold', 'test-slug', undefined);
    expect(result).toEqual(mockData);
  });
});

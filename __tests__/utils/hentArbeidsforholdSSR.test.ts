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

  it('throws when uuid is an array', async () => {
    await expect(hentArbeidsforholdSSR(['a', 'b'], 'token')).rejects.toThrow(
      'Ugyldig uuid: må være en streng, ikke en array'
    );
    expect(fetchDataSSR).not.toHaveBeenCalled();
  });

  it('throws when uuid is undefined', async () => {
    await expect(hentArbeidsforholdSSR(undefined, 'token')).rejects.toThrow('Ugyldig uuid: må være en gyldig UUID');
    expect(fetchDataSSR).not.toHaveBeenCalled();
  });

  it('throws when uuid is an empty string', async () => {
    await expect(hentArbeidsforholdSSR('', 'token')).rejects.toThrow('Ugyldig uuid: må være en gyldig UUID');
    expect(fetchDataSSR).not.toHaveBeenCalled();
  });

  it('delegates to fetchDataSSR with token', async () => {
    const mockData = { ansettelsesforhold: [] };
    vi.mocked(fetchDataSSR).mockResolvedValue(mockData as never);

    const result = await hentArbeidsforholdSSR('52ad58fb-a3cc-4c43-a20d-53fe74db31f9', 'test-token');

    expect(fetchDataSSR).toHaveBeenCalledWith(
      'http://api-host/api/arbeidsforhold',
      '52ad58fb-a3cc-4c43-a20d-53fe74db31f9',
      'test-token'
    );
    expect(result).toEqual(mockData);
  });

  it('delegates to fetchDataSSR without token', async () => {
    const mockData = { ansettelsesforhold: [] };
    vi.mocked(fetchDataSSR).mockResolvedValue(mockData as never);

    const result = await hentArbeidsforholdSSR('52ad58fb-a3cc-4c43-a20d-53fe74db31f9');

    expect(fetchDataSSR).toHaveBeenCalledWith(
      'http://api-host/api/arbeidsforhold',
      '52ad58fb-a3cc-4c43-a20d-53fe74db31f9',
      undefined
    );
    expect(result).toEqual(mockData);
  });
});

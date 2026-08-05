import { describe, it, expect, vi, beforeEach } from 'vitest';
import hentForespoerselSSR from '../../utils/hentForespoerselSSR';
import fetchDataSSR from '../../utils/fetchDataSSR';

vi.mock('../../utils/fetchDataSSR');

describe('hentForespoerselSSR', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.IM_API_URI = 'api-host';
    process.env.PREUTFYLT_INNTEKTSMELDING_API = '/api/inntektsmelding';
  });

  it('should throw an error when pathSlug is an array', async () => {
    await expect(hentForespoerselSSR(['slug1', 'slug2'], 'token')).rejects.toThrow(
      'Ugyldig pathSlug: må være en streng, ikke en array'
    );
    expect(fetchDataSSR).not.toHaveBeenCalled();
  });

  it('should throw an error when pathSlug is undefined', async () => {
    await expect(hentForespoerselSSR(undefined, 'token')).rejects.toThrow(
      'Ugyldig pathSlug: må være en streng, ikke en array'
    );
    expect(fetchDataSSR).not.toHaveBeenCalled();
  });

  it('should throw an error when pathSlug is empty string', async () => {
    await expect(hentForespoerselSSR('', 'token')).rejects.toThrow(
      'Ugyldig pathSlug: må være en streng, ikke en array'
    );
    expect(fetchDataSSR).not.toHaveBeenCalled();
  });

  it('should call fetchDataSSR with correct parameters when pathSlug is a string', async () => {
    const mockData = { data: { id: '123' } };
    vi.mocked(fetchDataSSR).mockResolvedValue(mockData as any);

    const result = await hentForespoerselSSR('test-slug', 'test-token');

    expect(fetchDataSSR).toHaveBeenCalledWith('http://api-host/api/inntektsmelding', 'test-slug', 'test-token');
    expect(result).toEqual(mockData);
  });

  it('should call fetchDataSSR without token when token is undefined', async () => {
    const mockData = { id: '456' };
    vi.mocked(fetchDataSSR).mockResolvedValue(mockData as any);

    const result = await hentForespoerselSSR('test-slug', undefined);

    expect(fetchDataSSR).toHaveBeenCalledWith('http://api-host/api/inntektsmelding', 'test-slug', undefined);
    expect(result).toEqual(mockData);
  });
});

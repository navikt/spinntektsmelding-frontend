import { describe, it, expect, vi, beforeEach } from 'vitest';
import hentForespoerselSSR from '../../utils/hentForespoerselSSR';
import fetchKvitteringsdataSSR from '../../utils/fetchKvitteringsdataSSR';

vi.mock('../../utils/fetchKvitteringsdataSSR');

describe('hentForespoerselSSR', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.IM_API_URI = 'api-host';
    process.env.PREUTFYLT_INNTEKTSMELDING_API = '/api/inntektsmelding';
  });

  it('should return null data when pathSlug is an array', async () => {
    const result = await hentForespoerselSSR(['slug1', 'slug2'], 'token');
    expect(result).toEqual({ data: null });
    expect(fetchKvitteringsdataSSR).not.toHaveBeenCalled();
  });

  it('should return null data when pathSlug is undefined', async () => {
    const result = await hentForespoerselSSR(undefined, 'token');
    expect(result).toEqual({ data: null });
    expect(fetchKvitteringsdataSSR).not.toHaveBeenCalled();
  });

  it('should return null data when pathSlug is empty string', async () => {
    const result = await hentForespoerselSSR('', 'token');
    expect(result).toEqual({ data: null });
    expect(fetchKvitteringsdataSSR).not.toHaveBeenCalled();
  });

  it('should call fetchKvitteringsdataSSR with correct parameters when pathSlug is a string', async () => {
    const mockData = { data: { id: '123' } };
    vi.mocked(fetchKvitteringsdataSSR).mockResolvedValue(mockData as any);

    const result = await hentForespoerselSSR('test-slug', 'test-token');

    expect(fetchKvitteringsdataSSR).toHaveBeenCalledWith(
      'http://api-host/api/inntektsmelding',
      'test-slug',
      'test-token'
    );
    expect(result).toEqual(mockData);
  });

  it('should call fetchKvitteringsdataSSR without token when token is undefined', async () => {
    const mockData = { data: { id: '456' } };
    vi.mocked(fetchKvitteringsdataSSR).mockResolvedValue(mockData as any);

    const result = await hentForespoerselSSR('test-slug', undefined);

    expect(fetchKvitteringsdataSSR).toHaveBeenCalledWith('http://api-host/api/inntektsmelding', 'test-slug', undefined);
    expect(result).toEqual(mockData);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import hentKvitteringsdataAgiSSR from '../../utils/hentKvitteringsdataAgiSSR';
import fetchKvitteringsdataSSR from '../../utils/fetchKvitteringsdataSSR';
import kvittering from '../../mockdata/selvbestemt-kvittering.json';

vi.mock('../../utils/fetchKvitteringsdataSSR');

describe('hentKvitteringsdataAgiSSR', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.IM_API_URI = 'api-host';
    process.env.INNSENDING_SELVBESTEMT_INNTEKTSMELDING_API = '/api/kvittering';
  });

  it('should return null data when pathSlug is an array', async () => {
    const result = await hentKvitteringsdataAgiSSR(['slug1', 'slug2'], 'token');
    expect(result).toEqual({ data: null });
    expect(fetchKvitteringsdataSSR).not.toHaveBeenCalled();
  });

  it('should return null data when pathSlug is undefined', async () => {
    const result = await hentKvitteringsdataAgiSSR(undefined, 'token');
    expect(result).toEqual({ data: null });
    expect(fetchKvitteringsdataSSR).not.toHaveBeenCalled();
  });

  it('should return null data when pathSlug is empty string', async () => {
    const result = await hentKvitteringsdataAgiSSR('', 'token');
    expect(result).toEqual({ data: null });
    expect(fetchKvitteringsdataSSR).not.toHaveBeenCalled();
  });

  it('should call fetchKvitteringsdataSSR with correct parameters when pathSlug is a string', async () => {
    const mockData = { status: 200, data: { success: kvittering } };
    vi.mocked(fetchKvitteringsdataSSR).mockResolvedValue(mockData);

    const result = await hentKvitteringsdataAgiSSR('test-slug', 'test-token');

    expect(fetchKvitteringsdataSSR).toHaveBeenCalledWith('http://api-host/api/kvittering', 'test-slug', 'test-token');
    expect(result).toEqual(mockData);
    expect(result.data?.success.selvbestemtInntektsmelding.mottatt).toBe(kvittering.selvbestemtInntektsmelding.mottatt);
  });

  it('should call fetchKvitteringsdataSSR without token when token is undefined', async () => {
    const mockData = { status: 200, data: { success: kvittering } };
    vi.mocked(fetchKvitteringsdataSSR).mockResolvedValue(mockData);

    const result = await hentKvitteringsdataAgiSSR('test-slug', undefined);

    expect(fetchKvitteringsdataSSR).toHaveBeenCalledWith('http://api-host/api/kvittering', 'test-slug', undefined);
    expect(result).toEqual(mockData);
  });
});

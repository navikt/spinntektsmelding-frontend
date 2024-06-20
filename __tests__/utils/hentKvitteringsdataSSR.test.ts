import { vi } from 'vitest';
import fetchKvitteringsdata from '../../utils/fetchKvitteringsdataSSR';
import hentKvitteringsdataSSR from '../../utils/hentKvitteringsdataSSR';

vi.mock('../../utils/fetchKvitteringsdataSSR');

describe('hentKvitteringsdataSSR', () => {
  const pathSlug = 'example-path';
  const token = 'abc123';

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return an empty object if pathSlug is an array', async () => {
    const result = await hentKvitteringsdataSSR(['slug1', 'slug2'], token);
    expect(result).toEqual({});
  });

  it('should call fetchKvitteringsdataSSR with the correct arguments', async () => {
    const expectedUrl = `http://${process.env.IM_API_URI}${process.env.INNSENDING_SELVBESTEMT_INNTEKTSMELDING_API}`;
    await hentKvitteringsdataSSR(pathSlug, token);
    expect(fetchKvitteringsdata).toHaveBeenCalledWith(expectedUrl, pathSlug, token);
  });
});

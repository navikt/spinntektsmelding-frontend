import { vi } from 'vitest';
import fetchKvitteringsdata from '../../utils/fetchKvitteringsdata';
import createFetchMock from 'vitest-fetch-mock';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

describe('fetchKvitteringsdata', () => {
  beforeEach(() => {
    fetchMocker.doMock();
    fetch.resetMocks();
  });

  it('returns the fetched data when the request is successful', async () => {
    const url = 'http://example.com/api/forespoersel';
    const forespoerselId = '8d50ef20-37b5-4829-ad83-56219e70b375';

    fetch.mockResponseOnce(JSON.stringify('Data fetched successfully', { status: 200 }));

    const response = await fetchKvitteringsdata(url, forespoerselId);

    expect(response).toEqual({ status: 200, data: 'Data fetched successfully' });
  });

  it('returns a 404 status and empty data when the request is made with an invalid UUID', async () => {
    const url = '/api/forespoersel';
    const forespoerselId = 'invalid-uuid';

    fetch.mockResponseOnce(null, { status: 404 });

    const response = await fetchKvitteringsdata(url, forespoerselId);

    expect(response).toEqual({ status: 404, data: undefined });
  });

  it('throws a NetworkError when the request fails', async () => {
    fetch.mockResponseOnce(null, { status: 500, statusText: 'Internal Server Error' });

    const url = 'http://example.com/api/forespoersel';
    const forespoerselId = '8d50ef20-37b5-4829-ad83-56219e70b375';

    await expect(fetchKvitteringsdata(url, forespoerselId)).rejects.toThrowError(
      'An error occurred while fetching the data.'
    );
  });

  it('throws a NetworkError when the response data cannot be decoded', async () => {
    const url = 'http://example.com/api/forespoersel';
    const forespoerselId = '8d50ef20-37b5-4829-ad83-56219e70b375';

    fetch.mockResponseOnce('ups, something went wrong');

    await expect(fetchKvitteringsdata(url, forespoerselId)).rejects.toThrowError(
      'An error occurred while fetching the data.'
    );
  });

  it('gives a nice response', async () => {
    const kvitteringEkstern = {
      kvitteringEkstern: {
        avsenderSystem: 'test',
        referanse: 'test',
        tidspunkt: '2024-11-27T11:55:38.301Z'
      }
    };

    fetch.mockResponseOnce(JSON.stringify(kvitteringEkstern));

    const url = 'http://example.com/api/forespoersel';
    const forespoerselId = '8d50ef20-37b5-4829-ad83-56219e70b375';

    const result = await fetchKvitteringsdata(url, forespoerselId);

    expect(result).toEqual({ status: 200, data: kvitteringEkstern });
  });
});

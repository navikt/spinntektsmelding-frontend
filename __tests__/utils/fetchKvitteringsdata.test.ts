import { http, HttpResponse } from 'msw';
import fetchKvitteringsdata from '../../utils/fetchKvitteringsdata';

describe('fetchKvitteringsdata', () => {
  it.skip('returns the fetched data when the request is successful', async () => {
    const url = 'http://example.com/api/forespoersel';
    const forespoerselId = '8d50ef20-37b5-4829-ad83-56219e70b375';

    http.get('http://example.com/api/forespoersel/8d50ef20-37b5-4829-ad83-56219e70b375', () => {
      return new HttpResponse('Data fetched successfully', { status: 200 });
    });

    const response = await fetchKvitteringsdata(url, forespoerselId);

    expect(response).toEqual({ status: 200, data: { message: 'Data fetched successfully' } });
  });

  it('returns a 404 status and empty data when the request is made with an invalid UUID', async () => {
    const url = '/api/forespoersel';
    const forespoerselId = 'invalid-uuid';

    const response = await fetchKvitteringsdata(url, forespoerselId);

    expect(response).toEqual({ status: 404, data: {} });
  });

  it('throws a NetworkError when the request fails', async () => {
    http.get('http://example.com/api/forespoersel/8d50ef20-37b5-4829-ad83-56219e70b375', () => {
      return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' });
    });

    const url = 'http://example.com/api/forespoersel';
    const forespoerselId = '8d50ef20-37b5-4829-ad83-56219e70b375';

    await expect(fetchKvitteringsdata(url, forespoerselId)).rejects.toThrowError(
      'An error occurred while fetching the data.'
    );
  });

  it.skip('throws a NetworkError when the response data cannot be decoded', async () => {
    const url = 'http://example.com/api/forespoersel';
    const forespoerselId = '8d50ef20-37b5-4829-ad83-56219e70b375';

    http.get('http://example.com/api/forespoersel/8d50ef20-37b5-4829-ad83-56219e70b375', () => {
      return HttpResponse.json('Stuff went wrong');
    });

    await expect(fetchKvitteringsdata(url, forespoerselId)).rejects.toThrowError(
      'An error occurred while decoding the data.'
    );
  });
});

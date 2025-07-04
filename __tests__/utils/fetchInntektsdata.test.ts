import createFetchMock from 'vitest-fetch-mock';
import { vi } from 'vitest';
import fetchInntektsdata from '../../utils/fetchInntektsdata';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

describe('fetchInntektsdata', () => {
  const url = 'https://example.com';
  const forespoerselId = '123';
  const inntektsdato = new Date();

  beforeEach(() => {
    fetch.resetMocks();
  });

  it('should fetch data successfully', async () => {
    const data = {
      foo: 'bar'
    };

    const resultat = {
      data: {
        foo: 'bar'
      },
      status: 200
    };
    fetch.mockResponseOnce(JSON.stringify(data));

    const result = await fetchInntektsdata(url, forespoerselId, inntektsdato);

    expect(result).toEqual(resultat);
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][0]).toEqual(url);
    expect(fetch.mock.calls[0][1].method).toEqual('POST');
    expect(fetch.mock.calls[0][1].headers).toEqual({
      'Content-Type': 'application/json'
    });
    expect(fetch.mock.calls[0][1].body).toEqual(
      JSON.stringify({
        forespoerselId: forespoerselId,
        inntektsdato: inntektsdato.toISOString().split('T')[0]
      })
    );
  });

  it('should throw an error if the response is not ok', async () => {
    fetch.mockResponseOnce('', { status: 404 });

    await expect(() => fetchInntektsdata(url, forespoerselId, inntektsdato)).rejects.toThrow(
      'An error occurred while fetching the data.'
    );
  });

  it('should throw an error if the response cannot be decoded', async () => {
    fetch.mockResponseOnce('invalid json', { status: 200 });

    await expect(() => fetchInntektsdata(url, forespoerselId, inntektsdato)).rejects.toThrow(
      'An error occurred while fetching the data.'
    );
  });

  it('should throw an error when inntektsdato is not set', async () => {
    await expect(() => fetchInntektsdata(url, forespoerselId, undefined)).rejects.toThrow('No inntektsdato provided');
  });
});

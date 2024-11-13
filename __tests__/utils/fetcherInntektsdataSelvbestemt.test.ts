import { vi } from 'vitest';
import fetcherInntektsdataSelvbestemt from '../../utils/fetcherInntektsdataSelvbestemt';
import NetworkError from '../../utils/NetworkError';

describe('fetcherInntektsdataSelvbestemt', () => {
  const url = 'https://example.com/api';
  const identitetsnummer = '123456789';
  const orgnrUnderenhet = '987654321';
  const inntektsdato = new Date(2025, 3, 7);

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return an empty array if url is null', async () => {
    const result = await fetcherInntektsdataSelvbestemt(null, identitetsnummer, orgnrUnderenhet, inntektsdato);
    expect(result).toEqual([]);
  });

  it('should return an empty array if identitetsnummer is not provided', async () => {
    const result = await fetcherInntektsdataSelvbestemt(url, null, orgnrUnderenhet, inntektsdato);
    expect(result).toEqual([]);
  });

  it('should make a POST request with the correct parameters for selvbestemt', async () => {
    const expectedRequestBody = JSON.stringify({
      sykmeldtFnr: identitetsnummer,
      orgnr: orgnrUnderenhet,
      inntektsdato: '2025-04-07'
    });

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValueOnce({ data: 'mocked data' })
    };

    global.fetch.mockResolvedValueOnce(mockResponse);

    await fetcherInntektsdataSelvbestemt(
      url,
      identitetsnummer,
      orgnrUnderenhet,
      inntektsdato,
      'arbeidsgiverInitiertInnsending'
    );

    expect(global.fetch).toHaveBeenCalledWith(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: expectedRequestBody
    });
  });

  it('should make a POST request with the correct parameters for not selvbestemt', async () => {
    const expectedRequestBody = JSON.stringify({
      forespoerselId: 'ikke-arbeidsgiver-initiert-innsending',
      skjaeringstidspunkt: '2025-04-07'
    });

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValueOnce({ data: 'mocked data' })
    };

    global.fetch.mockResolvedValueOnce(mockResponse);

    await fetcherInntektsdataSelvbestemt(
      url,
      identitetsnummer,
      orgnrUnderenhet,
      inntektsdato,
      'ikke-arbeidsgiver-initiert-innsending'
    );

    expect(global.fetch).toHaveBeenCalledWith(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: expectedRequestBody
    });
  });

  it('should return the response data if the request is successful', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValueOnce({ data: 'mocked data' })
    };

    global.fetch.mockResolvedValueOnce(mockResponse);

    const result = await fetcherInntektsdataSelvbestemt(url, identitetsnummer, orgnrUnderenhet, inntektsdato);

    expect(result).toEqual({ data: 'mocked data' });
  });

  it('should throw a NetworkError if the request fails', async () => {
    const mockResponse = {
      ok: false,
      status: 500
    };

    global.fetch.mockResolvedValueOnce(mockResponse);

    await expect(
      fetcherInntektsdataSelvbestemt(url, identitetsnummer, orgnrUnderenhet, inntektsdato)
    ).rejects.toThrowError(NetworkError);
  });

  it('should throw a NetworkError if the response data cannot be decoded', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockRejectedValueOnce(new Error('Invalid JSON'))
    };

    global.fetch.mockResolvedValueOnce(mockResponse);

    await expect(
      fetcherInntektsdataSelvbestemt(url, identitetsnummer, orgnrUnderenhet, inntektsdato)
    ).rejects.toThrowError(NetworkError);
  });
});

import { vi } from 'vitest';
import fetcherSykepengesoeknader from '../../utils/fetcherSykepengesoeknader';
import NetworkError from '../../utils/NetworkError';

describe('fetcherSykepengesoeknader', () => {
  const url = 'https://example.com/api';
  const identitetsnummer = '123456789';
  const orgnrUnderenhet = '987654321';
  const eldsteFom = '2022-02-02';

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return an empty array if url is null', async () => {
    const result = await fetcherSykepengesoeknader(null, identitetsnummer, orgnrUnderenhet, eldsteFom);
    expect(result).toEqual([]);
  });

  it('should return an empty array if identitetsnummer is not provided', async () => {
    const result = await fetcherSykepengesoeknader(url, undefined, orgnrUnderenhet, eldsteFom);
    expect(result).toEqual([]);
  });

  it('should make a POST request with the correct parameters', async () => {
    const expectedRequestBody = JSON.stringify({
      fnr: identitetsnummer,
      orgnummer: orgnrUnderenhet,
      eldsteFom: eldsteFom
    });

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValueOnce({ data: 'mocked data' })
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await fetcherSykepengesoeknader(url, identitetsnummer, orgnrUnderenhet, eldsteFom);

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

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await fetcherSykepengesoeknader(url, identitetsnummer, orgnrUnderenhet, eldsteFom);

    expect(result).toEqual({ data: 'mocked data' });
  });

  it('should throw a NetworkError if the request fails', async () => {
    const mockResponse = {
      ok: false,
      status: 500
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await expect(fetcherSykepengesoeknader(url, identitetsnummer, orgnrUnderenhet, eldsteFom)).rejects.toThrowError(
      NetworkError
    );
  });

  it('should throw a NetworkError if the response data cannot be decoded', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockRejectedValueOnce(new Error('Invalid JSON'))
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await expect(fetcherSykepengesoeknader(url, identitetsnummer, orgnrUnderenhet, eldsteFom)).rejects.toThrowError(
      NetworkError
    );
  });
});

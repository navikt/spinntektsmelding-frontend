import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fetchInntektskjemaForNotifikasjon from '../../state/fetchInntektskjemaForNotifikasjon';
import NetworkError from '../../utils/NetworkError';
// import fetchInntektskjemaForNotifikasjon from './fetchInntektskjemaForNotifikasjon';
// import NetworkError from '../utils/NetworkError';

type FetchMock = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

describe('fetchInntektskjemaForNotifikasjon', () => {
  const url = 'https://api.test/inntektskjema';
  const uuid = '1234-uuid';
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it('resolves with parsed JSON when response is ok', async () => {
    const mockData = { foo: 'bar' };
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockData)
    } as unknown as Response;

    global.fetch = vi.fn().mockResolvedValue(mockResponse) as FetchMock;

    const result = await fetchInntektskjemaForNotifikasjon(url, uuid);

    expect(global.fetch).toHaveBeenCalledWith(url + '/' + uuid, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    expect(result).toEqual(mockData);
  });

  it('throws NetworkError when response.ok is false', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      json: vi.fn() // shouldn't be called
    } as unknown as Response;

    global.fetch = vi.fn().mockResolvedValue(mockResponse) as FetchMock;

    await expect(fetchInntektskjemaForNotifikasjon(url, uuid)).rejects.toBeInstanceOf(NetworkError);
  });

  it('throws NetworkError when json parsing fails', async () => {
    const parseError = new Error('Invalid JSON');
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(parseError)
    } as unknown as Response;

    global.fetch = vi.fn().mockResolvedValue(mockResponse) as FetchMock;

    await expect(fetchInntektskjemaForNotifikasjon(url, uuid)).rejects.toBeInstanceOf(NetworkError);
  });
});

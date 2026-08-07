import { vi, type Mock } from 'vitest';
import fetchKvitteringsdata from '../../utils/fetchKvitteringsdataSSR';

describe('fetchKvitteringsdata', () => {
  const UUID = '123e4567-e89b-12d3-a456-426614174000';
  let mockFetch: Mock;

  beforeEach(() => {
    // Mock the global fetch function
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return the response data if the request is successful', async () => {
    // Mock the fetch function to return a successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce({ foo: 'bar' })
    });

    const url = 'https://example.com/api';
    const forespoerselId = UUID;
    const token = 'abc123';

    const result = await fetchKvitteringsdata(url, forespoerselId, token);

    expect(global.fetch).toHaveBeenCalledWith(`${url}/${forespoerselId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    expect(result).toEqual({ status: 200, data: { foo: 'bar' } });
  });

  it('should throw a NetworkError if the request fails', async () => {
    // Mock the fetch function to return an error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const url = 'https://example.com/api';
    const forespoerselId = UUID;
    const token = 'abc123';

    await expect(fetchKvitteringsdata(url, forespoerselId, token)).rejects.toThrow(
      'An error occurred while fetching the data.'
    );
  });

  it('should throw a NetworkError if the response data cannot be decoded', async () => {
    // Mock the fetch function to return a successful response with invalid JSON
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValueOnce(new Error('Invalid JSON'))
    });

    const url = 'https://example.com/api';
    const forespoerselId = UUID;
    const token = 'abc123';

    await expect(fetchKvitteringsdata(url, forespoerselId, token)).rejects.toThrow(
      'An error occurred while decoding the data.'
    );
  });

  it('should return a 404 status if the provided forespoerselId is not a valid UUID', async () => {
    const url = 'https://example.com/api';
    const forespoerselId = 'invalid-uuid';
    const token = 'abc123';

    const result = await fetchKvitteringsdata(url, forespoerselId, token);

    expect(result).toEqual({ status: 404, data: {} });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import fetchDataSSR from '../../utils/fetchDataSSR';

vi.mock('@navikt/next-logger', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}));

describe('fetchDataSSR', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 404 payload for invalid UUID and does not call fetch', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const result = await fetchDataSSR('http://api-host/api/data', 'invalid-uuid', 'token');

    expect(result).toEqual({ status: 404, data: {} });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('calls fetch and returns parsed JSON for valid UUID', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ id: '1' })
    } as unknown as Response);

    const id = '123e4567-e89b-12d3-a456-426614174000';
    const result = await fetchDataSSR('http://api-host/api/data', id, 'test-token');

    expect(fetchSpy).toHaveBeenCalledWith(`http://api-host/api/data/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token'
      }
    });
    expect(result).toEqual({ id: '1' });
  });

  it('throws mapped NetworkError when response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500
    } as unknown as Response);

    const id = '123e4567-e89b-12d3-a456-426614174000';
    await expect(fetchDataSSR('http://api-host/api/data', id, 'test-token')).rejects.toMatchObject({
      message: 'An error occurred while fetching the data.',
      status: 500
    });
  });

  it('throws decode error when json parsing fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
    } as unknown as Response);

    const id = '123e4567-e89b-12d3-a456-426614174000';
    await expect(fetchDataSSR('http://api-host/api/data', id, 'test-token')).rejects.toMatchObject({
      message: 'An error occurred while decoding the data.'
    });
  });
});

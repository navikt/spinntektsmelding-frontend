import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fetcherArbeidsgiverListe from '../../utils/fetcherArbeidsgiverListe';
import NetworkError from '../../utils/NetworkError';

describe('fetcherArbeidsgiverListe', () => {
  const ORIGINAL_FETCH = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = ORIGINAL_FETCH;
  });

  it('resolves to an empty array when url is null', async () => {
    await expect(fetcherArbeidsgiverListe(null)).resolves.toEqual([]);
  });

  it('fetches and returns JSON data when response is OK', async () => {
    const data = [{ id: 1, name: 'Test' }];
    const mockJson = vi.fn().mockResolvedValue(data);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: mockJson
    } as any);

    const result = await fetcherArbeidsgiverListe('http://example.com');
    expect(global.fetch).toHaveBeenCalledWith('http://example.com', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    expect(result).toEqual(data);
    expect(mockJson).toHaveBeenCalled();
  });

  it('throws NetworkError with server error message on non-OK response', async () => {
    const errorBody = { error: 'Server failure' };
    const mockJson = vi.fn().mockResolvedValue(errorBody);
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: mockJson
    } as any);

    try {
      await fetcherArbeidsgiverListe('http://example.com');
      throw new Error('Expected to throw');
    } catch (err: any) {
      expect(err).toBeInstanceOf(NetworkError);
      expect(err.message).toBe('Kunne ikke tolke resultatet fra serveren');
      expect(err.status).toBe(500);
      await expect(err.info).resolves.toEqual(errorBody);
    }
  });

  it('throws NetworkError with parse error message when fetch rejects', async () => {
    const fetchError = new Error('network down');
    // @ts-ignore
    global.fetch = vi.fn().mockRejectedValue(fetchError);

    try {
      await fetcherArbeidsgiverListe('http://example.com');
      throw new Error('Expected to throw');
    } catch (err: any) {
      expect(err).toBeInstanceOf(NetworkError);
      expect(err.message).toBe('Kunne ikke tolke resultatet fra serveren');
      expect(err.status).toBeUndefined();
      expect(err.info).toBeUndefined();
    }
  });
});

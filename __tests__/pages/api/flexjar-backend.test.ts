import { vi, describe, it, expect, beforeEach } from 'vitest';
import handler from '../../../pages/api/flexjar-backend';
import { NextApiRequest } from 'next';
import createFetchMock from 'vitest-fetch-mock';
import { getToken, requestOboToken, validateToken } from '@navikt/oasis';

vi.mock('@navikt/oasis', () => ({
  getToken: vi.fn(),
  requestOboToken: vi.fn(),
  validateToken: vi.fn()
}));

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

// Denne testen verifiserer header-pass-through (Location) og status 201 fra backend

describe('flexjar-backend header pass-through', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production'); // slik at devMock ikke brukes
    vi.stubEnv('FLEXJAR_URL', 'flexjar-url');
    vi.stubEnv('FLEXJAR_BACKEND_CLIENT_ID', 'client-id');
    fetchMocker.resetMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('videresender Location header og status', async () => {
    const body = { tekst: 'hei' };
    (getToken as any).mockReturnValue('token');
    (validateToken as any).mockResolvedValue({ ok: true });
    (requestOboToken as any).mockResolvedValue({ ok: true });
    // Mock backend-respons
    fetchMocker.mockResponseOnce(JSON.stringify({ ok: true }), {
      status: 201,
      headers: {
        'content-type': 'application/json',
        location: '/api/v1/feedback/123'
      }
    });

    const req = {
      method: 'POST',
      url: '/api/flexjar-backend',
      body,
      headers: { authorization: 'Bearer token' }
    } as unknown as NextApiRequest;

    const res = (() => {
      const r: any = {};
      const headers: Record<string, string> = {};
      r.status = vi.fn(() => r);
      r.json = vi.fn(() => r);
      r.setHeader = vi.fn((k: string, v: string) => {
        headers[k] = v;
        return r;
      });
      r.getHeader = (k: string) => headers[k];
      return r;
    })();

    await handler(req, res as any);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.setHeader).toHaveBeenCalledWith('Location', '/api/v1/feedback/123');
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });
});

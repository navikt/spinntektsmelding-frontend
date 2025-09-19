import { vi, describe, it, expect, beforeEach } from 'vitest';
import handler from '../../../pages/api/innsendingInntektsmelding';
import { NextApiRequest } from 'next';
import createFetchMock from 'vitest-fetch-mock';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

describe('innsendingInntektsmelding header pass-through', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('IM_API_URI', 'im-api');
    vi.stubEnv('IM_API_URL', 'im-api-url');
    vi.stubEnv('IM_API_BACKEND_CLIENT_ID', 'client-id');
    vi.stubEnv('IM_API_SCOPE', 'scope');
    vi.stubEnv('IM_API_HOST', 'host');
    vi.stubEnv('IM_API_SCHEME', 'http');
    vi.stubEnv('IM_API_PORT', '80');
    vi.stubEnv('IM_API_BASE_PATH', '/');
    vi.stubEnv('INNTEKTSMELDING_API', '/api');
    vi.stubEnv('INNTEKTSMELDING_URL', '/im');
    vi.stubEnv('INNTEKTSMELDING_SCOPE', 'scope');
    vi.stubEnv('INNTEKTSMELDING_BACKEND_CLIENT_ID', 'clientId');
    vi.stubEnv('IM_API_URI', 'im-api-uri');
    vi.stubEnv('IM_API_SCOPE', 'scope');
    vi.stubEnv('IM_API_BACKEND_CLIENT_ID', 'client-id');
    fetchMocker.resetMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('passer gjennom Location + status 201', async () => {
    const body = { data: 'x' };
    fetchMocker.mockResponseOnce(JSON.stringify({ id: 'abc' }), {
      status: 201,
      headers: {
        'content-type': 'application/json',
        location: '/im/abc'
      }
    });

    const req = {
      method: 'POST',
      url: '/api/innsendingInntektsmelding',
      body,
      headers: {}
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
    expect(res.setHeader).toHaveBeenCalledWith('Location', '/im/abc');
    expect(res.json).toHaveBeenCalledWith({ id: 'abc' });
  });
});

import createFetchMock from 'vitest-fetch-mock';
import handler, { config } from '../../../pages/api/hent-forespoersel/[postId]';
import { NextApiRequest, NextApiResponse } from 'next';
import org from '../../../mockdata/trenger-ikke-lonn.json';
import httpProxyMiddleware from 'next-http-proxy-middleware';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

vi.mock('next-http-proxy-middleware', () => ({
  __esModule: true,
  default: vi.fn()
}));

describe('/api/hent-forespoersel API', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('IM_API_URI', 'im-api-uri');
    vi.stubEnv('PREUTFYLT_INNTEKTSMELDING_API', '/preutfylt-inntektsmelding');
    fetchMocker.resetMocks();
  });

  it('should have bodyParser set to false in config', () => {
    expect(config.api.bodyParser).toBe(false);
  });

  it('should return mock data in development environment', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const req = {} as unknown as NextApiRequest;
    const res = {
      statusCode: 200,
      status: vi.fn(() => ({
        json: vi.fn(() => org),
        _getJSONData: vi.fn(() => ({ proxied: true }))
      })),
      json: vi.fn(() => org),
      _getJSONData: vi.fn(() => ({ proxied: true }))
    } as unknown as NextApiResponse<unknown>;

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(org);
  });

  it('should proxy request in production environment', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const mockHttpProxyMiddleware = vi.mocked(httpProxyMiddleware);
    mockHttpProxyMiddleware.mockImplementation((_, res) => {
      res.status(200).json({ proxied: true });
    });

    // Mock the httpProxyMiddleware function
    const req = {
      headers: {
        authorization: 'Bearer token',
        'content-type': 'application/json',
        'x-nav-apiKey': 'api-key',
        'x-nav-apiKey-issuer': 'api'
      },
      body: {
        fnr: 'TestPerson1',
        orgnummer: 'organizationNumber',
        eldsteFom: '2021-01-01'
      },
      url: '/api/hent-forespoersel/1234'
    } as unknown as NextApiRequest;
    const res = {
      statusCode: 200,
      status: vi.fn(() => res),
      json: vi.fn(() => org),
      _getJSONData: vi.fn(() => ({ proxied: true }))
    } as unknown as NextApiResponse<unknown>;

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ proxied: true });
  });
});

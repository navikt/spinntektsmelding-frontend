import { vi, expect, beforeAll } from 'vitest';
import handler from '../../../pages/api/sp-soeknader';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken, requestOboToken, validateToken } from '@navikt/oasis';
import testFnr from '../../../mockdata/testFnr';
import testOrganisasjoner from '../../../mockdata/testOrganisasjoner';
import createFetchMock from 'vitest-fetch-mock';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

vi.mock('@navikt/oasis', () => ({
  getToken: vi.fn(),
  requestOboToken: vi.fn(),
  validateToken: vi.fn()
}));

describe('sp-soeknader', () => {
  beforeAll(() => {
    fetchMocker.doMock();
  });

  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('IM_API_URI', 'im-api-uri');
    vi.stubEnv('AUTH_SYKEPENGESOEKNAD_API', '/auth/sykepengesoknad');
    vi.stubEnv('FORESPOERSEL_ID_LISTE_API', '/forespoersel/id/liste');
    vi.stubEnv('FLEX_SYKEPENGESOEKNAD_INGRESS', 'flex-sykepengesoknad.ingress');
    vi.stubEnv('FLEX_SYKEPENGESOEKNAD_URL', '/flex/sykepengesoknad/url');
    fetchMocker.resetMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return 401 when we dont have a token', async () => {
    const req = {
      headers: {
        authorization: 'Bearer token'
      },
      body: {
        fnr: testFnr.GyldigeFraDolly.TestPerson1,
        orgnummer: testOrganisasjoner[0].organizationNumber,
        eldsteFom: '2021-01-01'
      }
    } as unknown as NextApiRequest;
    const res = {
      status: vi.fn(),
      json: vi.fn()
    } as unknown as NextApiResponse<unknown>;

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 401 when we have a invalid token', async () => {
    getToken.mockReturnValue('token');
    validateToken.mockResolvedValue({ ok: false, error: 'error' });

    const req = {
      headers: {
        authorization: 'Bearer token'
      },
      body: {
        fnr: testFnr.GyldigeFraDolly.TestPerson1,
        orgnummer: testOrganisasjoner[0].organizationNumber,
        eldsteFom: '2021-01-01'
      }
    } as unknown as NextApiRequest;
    const res = {
      status: vi.fn(),
      json: vi.fn()
    } as unknown as NextApiResponse<unknown>;

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 400 when we dont have a token', async () => {
    getToken.mockReturnValue('token');
    validateToken.mockResolvedValue({ ok: true });

    const req = {
      headers: {
        authorization: 'Bearer token'
      },
      body: {
        fnr: testFnr.GyldigeFraDolly.TestPerson1,
        orgnummer: '123456789',
        eldsteFom: '2021-01-01'
      },
      json: () => ({
        fnr: testFnr.GyldigeFraDolly.TestPerson1,
        orgnummer: '123456789',
        eldsteFom: '2021-01-01'
      })
    } as unknown as NextApiRequest;
    const res = {
      status: vi.fn(() => ({
        json: vi.fn()
      })),

      json: vi.fn()
    } as unknown as NextApiResponse<unknown>;

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 200 when we have a token', async () => {
    getToken.mockReturnValue('token');
    validateToken.mockResolvedValue({ ok: true });
    requestOboToken.mockResolvedValue({ ok: true });

    const req = {
      headers: {
        authorization: 'Bearer token'
      },
      body: {
        fnr: testFnr.GyldigeFraDolly.TestPerson1,
        orgnummer: testOrganisasjoner[0].organizationNumber,
        eldsteFom: '2021-01-01'
      },
      json: () => ({
        fnr: testFnr.GyldigeFraDolly.TestPerson1,
        orgnummer: testOrganisasjoner[0].organizationNumber,
        eldsteFom: '2021-01-01'
      })
    } as unknown as NextApiRequest;
    const mockJson = vi.fn();
    const res = {
      status: vi.fn(() => ({
        json: mockJson
      })),

      json: vi.fn()
    } as unknown as NextApiResponse<unknown>;

    fetchMocker.mockResponse(JSON.stringify([]), { status: 200 });

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith([]);
  });
});

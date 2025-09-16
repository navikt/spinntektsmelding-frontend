import { vi, expect, beforeAll } from 'vitest';
import handler from '../../../pages/api/sp-soeknader';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken, requestOboToken, validateToken } from '@navikt/oasis';
import type { Mock } from 'vitest';
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
    const res = (() => {
      const r: any = {};
      r.status = vi.fn(() => r);
      r.json = vi.fn(() => r);
      return r;
    })();

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'UNAUTHORIZED', message: 'Mangler token i header', details: undefined }
    });
  });

  it('should return 401 when we have a invalid token', async () => {
    (getToken as unknown as Mock).mockReturnValue('token');
    (validateToken as unknown as Mock).mockResolvedValue({ ok: false, error: 'error' });

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
    const res = (() => {
      const r: any = {};
      r.status = vi.fn(() => r);
      r.json = vi.fn(() => r);
      return r;
    })();

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'UNAUTHORIZED', message: 'Validering av token feilet', details: undefined }
    });
  });

  it('should return 400 when we dont have a token', async () => {
    (getToken as unknown as Mock).mockReturnValue('token');
    (validateToken as unknown as Mock).mockResolvedValue({ ok: true });

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
    const res = (() => {
      const r: any = {};
      r.status = vi.fn(() => r);
      r.json = vi.fn(() => r);
      return r;
    })();

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'UGYLDIG_ORGNR', message: 'Ugyldig organisasjonsnummer', details: undefined }
    });
  });

  it('should return 200 when we have a token', async () => {
    (getToken as unknown as Mock).mockReturnValue('token');
    (validateToken as unknown as Mock).mockResolvedValue({ ok: true });
    (requestOboToken as unknown as Mock).mockResolvedValue({ ok: true });

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
    const res = (() => {
      const r: any = {};
      r.status = vi.fn(() => r);
      r.json = vi.fn(() => r);
      return r;
    })();

    fetchMocker.mockResponse(JSON.stringify([]), { status: 200 });

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('should return 200 when we have a token and vedtaksperiodeliste', async () => {
    (getToken as unknown as Mock).mockReturnValue('token');
    (validateToken as unknown as Mock).mockResolvedValue({ ok: true });
    (requestOboToken as unknown as Mock).mockResolvedValue({ ok: true });

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
    const res = (() => {
      const r: any = {};
      r.status = vi.fn(() => r);
      r.json = vi.fn(() => r);
      return r;
    })();

    fetchMocker.mockResponses(
      [JSON.stringify(['token OK']), { status: 200 }],
      [JSON.stringify([{ vedtaksperiodeId: '12345' }]), { status: 200 }],
      [JSON.stringify([{ vedtaksperiodeId: '12345', forespoerselId: '54321' }]), { status: 200 }]
    );

    await handler(req, res);
    // expect(fetch.requests().length).toEqual(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        forespoerselId: '54321',
        vedtaksperiodeId: '12345'
      }
    ]);
  });
});

import { vi, expect, beforeAll } from 'vitest';
import handler from '../../../pages/api/sp-soeknader';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken, requestOboToken, validateToken } from '@navikt/oasis';
import testFnr from '../../../mockdata/testFnr';
import testOrganisasjoner from '../../../mockdata/testOrganisasjoner';
import createFetchMock from 'vitest-fetch-mock';
import fs from 'fs';
import { createMocks } from 'node-mocks-http';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

vi.mock('@navikt/oasis', () => ({
  getToken: vi.fn(),
  requestOboToken: vi.fn(),
  validateToken: vi.fn()
}));

vi.mock('@navikt/next-logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('@navikt/next-logger/team-log', () => ({
  teamLogger: {
    info: vi.fn()
  }
}));

import { logger } from '@navikt/next-logger';
import { teamLogger } from '@navikt/next-logger/team-log';

const mockLoggerInfo = vi.mocked(logger.info);
const mockTeamLoggerInfo = vi.mocked(teamLogger.info);

describe('sp-soeknader API', () => {
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
    vi.stubEnv('FLEX_SYKEPENGESOEKNAD_CLIENT_ID', 'client-id');
    fetchMocker.resetMocks();
    mockLoggerInfo.mockReset();
    mockTeamLoggerInfo.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return 401 when we dont have a token', async () => {
    const req = {
      method: 'POST',
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
    vi.mocked(getToken).mockReturnValue('token');
    vi.mocked(validateToken).mockResolvedValue({ ok: false, error: 'error' });

    const req = {
      method: 'POST',
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
    vi.mocked(getToken).mockReturnValue('token');
    vi.mocked(validateToken).mockResolvedValue({ ok: true });

    const req = {
      method: 'POST',
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
    vi.mocked(getToken).mockReturnValue('token');
    vi.mocked(validateToken).mockResolvedValue({ ok: true });
    vi.mocked(requestOboToken).mockResolvedValue({ ok: true });

    const req = {
      method: 'POST',
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

  it('should return 200 when we have a token and vedtaksperiodeliste', async () => {
    vi.mocked(getToken).mockReturnValue('token');
    vi.mocked(validateToken).mockResolvedValue({ ok: true });
    vi.mocked(requestOboToken).mockResolvedValue({ ok: true });

    const req = {
      method: 'POST',
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

    fetchMocker.mockResponses(
      [JSON.stringify(['token OK']), { status: 200 }],
      [JSON.stringify([{ vedtaksperiodeId: '12345' }]), { status: 200 }],
      [JSON.stringify([{ vedtaksperiodeId: '12345', forespoerselId: '54321' }]), { status: 200 }]
    );

    await handler(req, res);
    // expect(fetch.requests().length).toEqual(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith([
      {
        forespoerselId: '54321',
        vedtaksperiodeId: '12345'
      }
    ]);
  });

  it('should log a sanitized message when teamLogger fails', async () => {
    const fnr = testFnr.GyldigeFraDolly.TestPerson1;
    const orgnr = testOrganisasjoner[0].organizationNumber;
    vi.mocked(getToken).mockReturnValue('token');
    vi.mocked(validateToken).mockResolvedValue({ ok: true });
    vi.mocked(requestOboToken).mockResolvedValue({ ok: true });
    mockTeamLoggerInfo.mockImplementationOnce(() => {
      throw new Error('teamLogger failed');
    });

    const req = {
      method: 'POST',
      headers: { authorization: 'Bearer token' },
      body: { fnr, orgnummer: orgnr, eldsteFom: '2021-01-01' }
    } as unknown as NextApiRequest;
    const mockJson = vi.fn();
    const res = {
      status: vi.fn(() => ({ json: mockJson })),
      json: vi.fn()
    } as unknown as NextApiResponse<unknown>;

    fetchMocker.mockResponses([JSON.stringify(['token OK']), { status: 200 }], [JSON.stringify([]), { status: 200 }]);

    await handler(req, res);

    expect(mockTeamLoggerInfo).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfo).toHaveBeenCalledWith(
      'sp-soeknader: Fant 0 søknader hvorav 0 aktive søknader for orgnr [redacted] og fnr [redacted]'
    );
    expect(mockLoggerInfo.mock.calls[0][0]).not.toContain(fnr);
    expect(mockLoggerInfo.mock.calls[0][0]).not.toContain(orgnr);
  });

  describe('development environment', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should return mock data when file exists in development', async () => {
      const mockData = [{ id: '1', vedtaksperiodeId: 'vp-123' }];

      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockData));

      const { req, res } = createMocks({
        method: 'POST',
        body: { orgnummer: '123456789', fnr: '12345678901' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockData);
    });

    it('should return 200 when mock file does not exist in development', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      const { req, res } = createMocks({
        method: 'POST',
        body: { orgnummer: '123456789', fnr: '12345678901' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual([]);
    });

    it('should read mock file from correct path', async () => {
      const mockData = { test: 'data' };
      const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      const readFileSpy = vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockData));

      const { req, res } = createMocks({
        method: 'POST',
        body: { orgnummer: '123456789', fnr: '12345678901' }
      });

      await handler(req, res);

      expect(existsSpy).toHaveBeenCalledWith(expect.stringContaining('mockdata/sp-soeknad-ingenting.json'));
      expect(readFileSpy).toHaveBeenCalledWith(expect.stringContaining('mockdata/sp-soeknad-ingenting.json'), 'utf-8');
    });

    it('should not check token in development mode', async () => {
      const mockData = [{ id: '1' }];
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockData));

      const { req, res } = createMocks({
        method: 'POST',
        body: { orgnummer: '123456789', fnr: '12345678901' }
        // No Authorization header
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });

    it('should handle invalid JSON in mock file', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue('invalid json');

      const { req, res } = createMocks({
        method: 'POST',
        body: { orgnummer: '123456789', fnr: '12345678901' }
      });

      await expect(handler(req, res)).rejects.toThrow();
    });
  });
});

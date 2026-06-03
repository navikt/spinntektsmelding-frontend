import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'node:fs';
import { createMocks } from 'node-mocks-http';

import { getToken, requestOboToken, validateToken } from '@navikt/oasis';
import isMod11Number from '../../../utils/isMod11Number';
import isFnrNumber from '../../../utils/isFnrNumber';
import safelyParseJSON from '../../../utils/safelyParseJson';

vi.mock('@navikt/oasis', () => ({
  getToken: vi.fn(),
  validateToken: vi.fn(),
  requestOboToken: vi.fn()
}));

vi.mock('@navikt/next-logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../../../utils/isMod11Number', () => ({
  __esModule: true,
  default: vi.fn()
}));

vi.mock('../../../utils/isFnrNumber', () => ({
  __esModule: true,
  default: vi.fn()
}));

vi.mock('../../../utils/safelyParseJson', () => ({
  __esModule: true,
  default: vi.fn()
}));

function createReq(body: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  return {
    body,
    headers
  } as unknown as NextApiRequest;
}

function createRes() {
  const res: Partial<NextApiResponse> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as NextApiResponse;
}

describe('arbeidsforhold API', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    vi.stubEnv('FLEX_SYKEPENGESOEKNAD_INGRESS', 'flex.example.no');
    vi.stubEnv('FLEX_SYKEPENGESOEKNAD_URL', '/sp/soeknader');
    vi.stubEnv('IM_API_URI', 'im-api.example.no');
    vi.stubEnv('AUTH_SYKEPENGESOEKNAD_API', '/auth');
    vi.stubEnv('FORESPOERSEL_ID_LISTE_API', '/forespoersler');
    vi.stubEnv('FLEX_SYKEPENGESOEKNAD_CLIENT_ID', 'client-id');
    (global as any).fetch = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns mock payload in development when file exists', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([{ id: 'x' }]));

    const { default: handler } = await import('../../../pages/api/arbeidsforhold');
    const { req, res } = createMocks({ method: 'POST', body: {} });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual([{ id: 'x' }]);
  });

  it('returns 404 in development when mock file is missing', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);

    const { default: handler } = await import('../../../pages/api/arbeidsforhold');
    const { req, res } = createMocks({ method: 'POST', body: {} });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Mock not found' });
  });

  it('returns 401 when token is missing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    (getToken as Mock).mockReturnValue(undefined);

    const { default: handler } = await import('../../../pages/api/arbeidsforhold');
    const req = createReq({});
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 for invalid orgnummer', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    (getToken as Mock).mockReturnValue('token');
    (validateToken as Mock).mockResolvedValue({ ok: true });
    (isMod11Number as Mock).mockReturnValue(false);

    const { default: handler } = await import('../../../pages/api/arbeidsforhold');
    const req = createReq({ orgnummer: '123' });
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Ugyldig organisasjonsnummer' });
  });

  it('returns 400 for invalid fnr', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    (getToken as Mock).mockReturnValue('token');
    (validateToken as Mock).mockResolvedValue({ ok: true });
    (isMod11Number as Mock).mockReturnValue(true);
    (isFnrNumber as Mock).mockReturnValue(false);
    (global.fetch as Mock).mockResolvedValueOnce({ ok: true, status: 200, statusText: 'OK' });
    (requestOboToken as Mock).mockResolvedValue({ ok: true, token: 'obo-token' });

    const { default: handler } = await import('../../../pages/api/arbeidsforhold');
    const req = createReq({ orgnummer: '810007982', fnr: '111', eldsteFom: '2024-01-01' });
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Ugyldig fødselsnummer' });
  });

  it('returns 400 for invalid eldsteFom', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    (getToken as Mock).mockReturnValue('token');
    (validateToken as Mock).mockResolvedValue({ ok: true });
    (isMod11Number as Mock).mockReturnValue(true);
    (isFnrNumber as Mock).mockReturnValue(true);
    (global.fetch as Mock).mockResolvedValueOnce({ ok: true, status: 200, statusText: 'OK' });
    (requestOboToken as Mock).mockResolvedValue({ ok: true, token: 'obo-token' });

    const { default: handler } = await import('../../../pages/api/arbeidsforhold');
    const req = createReq({ orgnummer: '810007982', fnr: '12345678910', eldsteFom: 'ugyldig-dato' });
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Ugyldig dato' });
  });

  it('returns 401 when OBO token request fails', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    (getToken as Mock).mockReturnValue('token');
    (validateToken as Mock).mockResolvedValue({ ok: true });
    (isMod11Number as Mock).mockReturnValue(true);
    (global.fetch as Mock).mockResolvedValueOnce({ ok: true, status: 200, statusText: 'OK' });
    (requestOboToken as Mock).mockResolvedValue({ ok: false, error: 'obo-error' });

    const { default: handler } = await import('../../../pages/api/arbeidsforhold');
    const req = createReq({ orgnummer: '810007982' });
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('returns empty list when no aktive søknader have vedtaksperiodeId', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    (getToken as Mock).mockReturnValue('token');
    (validateToken as Mock).mockResolvedValue({ ok: true });
    (isMod11Number as Mock).mockReturnValue(true);
    (isFnrNumber as Mock).mockReturnValue(true);
    (requestOboToken as Mock).mockResolvedValue({ ok: true, token: 'obo-token' });

    (global.fetch as Mock)
      .mockResolvedValueOnce({ ok: true, status: 200, statusText: 'OK' })
      .mockResolvedValueOnce({ ok: true, status: 200, statusText: 'OK' });

    (safelyParseJSON as Mock).mockResolvedValueOnce([{ vedtaksperiodeId: null }]);

    const { default: handler } = await import('../../../pages/api/arbeidsforhold');
    const req = createReq({ orgnummer: '810007982', fnr: '12345678910', eldsteFom: '2024-01-01' });
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('returns merged response with forespoerselId for aktive søknader', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    (getToken as Mock).mockReturnValue('token');
    (validateToken as Mock).mockResolvedValue({ ok: true });
    (isMod11Number as Mock).mockReturnValue(true);
    (isFnrNumber as Mock).mockReturnValue(true);
    (requestOboToken as Mock).mockResolvedValue({ ok: true, token: 'obo-token' });

    (global.fetch as Mock)
      .mockResolvedValueOnce({ ok: true, status: 200, statusText: 'OK' })
      .mockResolvedValueOnce({ ok: true, status: 200, statusText: 'OK' })
      .mockResolvedValueOnce({ ok: true, status: 200, statusText: 'OK' });

    (safelyParseJSON as Mock)
      .mockResolvedValueOnce([
        { vedtaksperiodeId: 'vp1', soknadstype: 'ARBEIDSTAKERE' },
        { vedtaksperiodeId: null, soknadstype: 'ANNET' }
      ])
      .mockResolvedValueOnce([{ vedtaksperiodeId: 'vp1', forespoerselId: 'fp1' }]);

    const { default: handler } = await import('../../../pages/api/arbeidsforhold');
    const req = createReq({ orgnummer: '810007982', fnr: '12345678910', eldsteFom: '2024-01-01' });
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { vedtaksperiodeId: 'vp1', soknadstype: 'ARBEIDSTAKERE', forespoerselId: 'fp1' }
    ]);
  });
});

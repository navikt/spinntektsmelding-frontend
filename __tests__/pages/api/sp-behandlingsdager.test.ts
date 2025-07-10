import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import type { NextApiRequest, NextApiResponse } from 'next';
import testdata from '../../../mockdata/sp-soeknad.json';
import handler from '../../../pages/api/sp-behandlingsdager';
import isMod11Number from '../../../utils/isMod10Number';
import safelyParseJSON from '../../../utils/safelyParseJson';
import { getToken, validateToken, requestOboToken } from '@navikt/oasis';

vi.mock('@navikt/oasis', () => ({
  getToken: vi.fn(),
  validateToken: vi.fn(),
  requestOboToken: vi.fn()
}));
vi.mock('../../../utils/isMod10Number', () => ({
  __esModule: true,
  default: vi.fn()
}));
vi.mock('../../../utils/safelyParseJson', () => ({
  __esModule: true,
  default: vi.fn()
}));

function createReq(body: any = {}, headers: Record<string, string> = {}): Partial<NextApiRequest> {
  return { body, headers };
}

function createRes() {
  const res: Partial<NextApiResponse> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.statusCode = 200;

  return res as NextApiResponse;
}

beforeEach(() => {
  vi.resetAllMocks();
  process.env.NODE_ENV = 'test';
  process.env.FLEX_SYKEPENGESOEKNAD_INGRESS = 'ingress';
  process.env.FLEX_SYKEPENGESOEKNAD_URL = '/url';
  process.env.IM_API_URI = 'uri';
  process.env.AUTH_SYKEPENGESOEKNAD_API = '/auth';
  process.env.FLEX_SYKEPENGESOEKNAD_CLIENT_ID = 'cid';
  (global as any).fetch = vi.fn();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('sp-behandlingsdager API handler', () => {
  it('returns testdata in development mode', async () => {
    process.env.NODE_ENV = 'development';
    vi.useFakeTimers();
    const req = createReq();
    const res = createRes();
    handler(req as any, res);
    vi.advanceTimersByTime(100);
    await vi.runAllTimersAsync();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(testdata);
  });

  it('401 when no token', async () => {
    (getToken as Mock).mockReturnValue(undefined);
    const req = createReq({}, {});
    const res = createRes();
    await handler(req as any, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).not.toHaveBeenCalled();
  });

  it('400 when invalid orgnr', async () => {
    (getToken as Mock).mockReturnValue('tok');
    (validateToken as Mock).mockResolvedValue({ ok: true });
    (isMod11Number as Mock).mockReturnValue(false);
    const req = createReq({ orgnummer: 'bad' });
    const res = createRes();
    await handler(req as any, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Ugyldig organisasjonsnummer' });
  });

  it('401 when token validation fails', async () => {
    (getToken as Mock).mockReturnValue('tok');
    (validateToken as Mock).mockResolvedValue({ ok: false, error: 'x' });
    (isMod11Number as Mock).mockReturnValue(true);
    const req = createReq({ orgnummer: '123' });
    const res = createRes();
    await handler(req as any, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('401 when OBO fails', async () => {
    (getToken as Mock).mockReturnValue('tok');
    (validateToken as Mock).mockResolvedValue({ ok: true });
    (isMod11Number as Mock).mockReturnValue(true);
    // auth API ok
    (global.fetch as Mock).mockResolvedValueOnce({ ok: true });
    (requestOboToken as Mock).mockResolvedValue({ ok: false, error: 'obo' });
    const req = createReq({ orgnummer: '123' });
    const res = createRes();
    await handler(req as any, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('error when soeknad fetch fails', async () => {
    (getToken as Mock).mockReturnValue('tok');
    (validateToken as Mock).mockResolvedValue({ ok: true });
    (isMod11Number as Mock).mockReturnValue(true);
    (global.fetch as Mock)
      .mockResolvedValueOnce({ ok: true }) // auth API
      .mockResolvedValueOnce({ ok: false, status: 403, statusText: 'nope' }); // soeknad

    (requestOboToken as Mock).mockResolvedValue({ ok: true, token: 'oboTok' });
    const req = createReq({ orgnummer: '123' });
    const res = createRes();
    await handler(req as any, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Feil ved kontroll av tilgang til sykepengesøknader' });
  });

  it('returns empty array when no BEHANDLINGSDAGER', async () => {
    (getToken as Mock).mockReturnValue('tok');
    (validateToken as Mock).mockResolvedValue({ ok: true });
    (isMod11Number as Mock).mockReturnValue(true);
    (global.fetch as Mock)
      .mockResolvedValueOnce({ ok: true }) // auth
      .mockResolvedValueOnce({ ok: true }); // soeknad
    (requestOboToken as Mock).mockResolvedValue({ ok: true, token: 'oboTok' });
    const data = [{ soknadstype: 'ANNET' }];
    (safelyParseJSON as Mock).mockResolvedValue(data);
    const req = createReq({ orgnummer: '123' });
    const res = createRes();
    await handler(req as any, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('merges behandlingsdager by sykmeldingId and dates', async () => {
    const data = [
      {
        sykmeldingId: '1',
        soknadstype: 'BEHANDLINGSDAGER',
        behandlingsdager: [1, 2],
        fom: '2021-01-02',
        tom: '2021-01-05'
      },
      {
        sykmeldingId: '1',
        soknadstype: 'BEHANDLINGSDAGER',
        behandlingsdager: [2, 3],
        fom: '2021-01-01',
        tom: '2021-01-06'
      }
    ];

    (getToken as Mock).mockReturnValue('tok');
    (validateToken as Mock).mockResolvedValue({ ok: true });
    (isMod11Number as Mock).mockReturnValue(true);
    (global.fetch as Mock)
      .mockResolvedValueOnce({ ok: true }) // auth
      .mockResolvedValueOnce({ ok: true, status: 200 }); // soeknad
    (requestOboToken as Mock).mockResolvedValue({ ok: true, token: 'oboTok' });
    (safelyParseJSON as Mock).mockResolvedValue(data);
    const req = createReq({ orgnummer: '123' });
    const res = createRes();
    await handler(req as any, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const result = (res.json as Mock).mock.calls[0][0];
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      sykmeldingId: '1',
      soknadstype: 'BEHANDLINGSDAGER',
      behandlingsdager: [1, 2, 3],
      fom: '2021-01-01',
      tom: '2021-01-06'
    });
  });
});

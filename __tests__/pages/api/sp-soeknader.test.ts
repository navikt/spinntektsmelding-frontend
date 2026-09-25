import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import handleProxyInit from '../../../utils/api/handleProxyInit';
import handler from '../../../pages/api/sp-soeknader';
import { logger } from '@navikt/next-logger';

vi.mock('next-http-proxy-middleware', () => ({
  default: vi.fn()
}));

vi.mock('../../../utils/api/handleProxyInit', () => ({
  default: vi.fn()
}));

vi.mock('@navikt/next-logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn()
  }
}));

const mockHttpProxyMiddleware = vi.mocked(httpProxyMiddleware);
const mockHandleProxyInit = vi.mocked(handleProxyInit);
const mockLoggerInfo = vi.mocked(logger.info);

const fnr = '25087327879';
const orgnummer = '810007672';

function createResponse() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { json, status, setHeader: vi.fn() } as unknown as NextApiResponse;
}

function createRequest(body: unknown = { fnr, orgnummer }) {
  return {
    method: 'POST',
    body,
    url: '/api/sp-soeknader'
  } as unknown as NextApiRequest;
}

describe('API Route: /api/sp-soeknader', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('IM_API_URI', 'api.example.com');
    vi.stubEnv('HENT-SOEKNADER', '/hent-soeknader');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returnerer mockdata i development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const response = createResponse();

    await handler(createRequest(), response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(expect.anything());
    expect(mockHttpProxyMiddleware).not.toHaveBeenCalled();
  });

  it('returnerer 400 ved ugyldig request body', () => {
    const response = createResponse();

    handler(createRequest({ fnr }), response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ error: 'Ugyldig forespørsel' });
  });

  it('returnerer 400 ved ugyldig organisasjonsnummer', () => {
    const response = createResponse();

    handler(createRequest({ fnr, orgnummer: '123456789' }), response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ error: 'Ugyldig organisasjonsnummer' });
  });

  it('returnerer 400 ved ugyldig fødselsnummer', () => {
    const response = createResponse();

    handler(createRequest({ fnr: '12345678901', orgnummer }), response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ error: 'Ugyldig fødselsnummer' });
  });

  it('proxyer gyldig request med riktig konfigurasjon', () => {
    const request = createRequest();
    const response = createResponse();

    handler(request, response);

    expect(mockHttpProxyMiddleware).toHaveBeenCalledWith(
      request,
      response,
      expect.objectContaining({
        target: 'http://api.example.com/hent-soeknader',
        pathRewrite: [{ patternStr: '^/api/sp-soeknader', replaceStr: '' }]
      })
    );
  });

  it('sender omskrevet request-body til proxy', () => {
    const response = createResponse();
    handler(createRequest(), response);

    const proxyConfig = mockHttpProxyMiddleware.mock.calls[0][2] as {
      onProxyInit: (proxy: { on: (event: string, callback: (proxyReq: unknown) => void) => void }) => void;
    };
    const proxyRequest = {
      setHeader: vi.fn(),
      write: vi.fn()
    };
    const proxy = {
      on: vi.fn((event: string, callback: (proxyReq: unknown) => void) => {
        if (event === 'proxyReq') {
          callback(proxyRequest);
        }
      })
    };

    proxyConfig.onProxyInit(proxy);

    expect(mockHandleProxyInit).toHaveBeenCalledWith(proxy);
    expect(proxyRequest.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(proxyRequest.setHeader).toHaveBeenCalledWith(
      'Content-Length',
      Buffer.byteLength(JSON.stringify({ orgnr: orgnummer, sykmeldtFnr: fnr, erBehandlingsdager: false }))
    );
    expect(proxyRequest.write).toHaveBeenCalledWith(
      JSON.stringify({ orgnr: orgnummer, sykmeldtFnr: fnr, erBehandlingsdager: false })
    );
  });

  it('returnerer 500 når nødvendig proxy-konfigurasjon mangler', () => {
    vi.stubEnv('HENT-SOEKNADER', undefined);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const response = createResponse();

    handler(createRequest(), response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ error: 'Server configuration error' });
    expect(mockLoggerInfo).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Missing required environment variables:',
      expect.objectContaining({ message: 'Missing required environment variable: HENT-SOEKNADER' })
    );
    consoleErrorSpy.mockRestore();
  });
});

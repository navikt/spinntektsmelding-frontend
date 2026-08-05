import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'node:fs';

vi.mock('next-http-proxy-middleware', () => ({
  default: vi.fn()
}));

vi.mock('../../../utils/api/handleProxyInit', () => ({
  default: vi.fn()
}));

import httpProxyMiddleware from 'next-http-proxy-middleware';
import handleProxyInit from '../../../utils/api/handleProxyInit';
import mockData from '../../../mockdata/ansettelsesforhold-to-perioder.json';

const mockHttpProxyMiddleware = vi.mocked(httpProxyMiddleware);
const mockHandleProxyInit = vi.mocked(handleProxyInit);

let handler: any;
let config: any;

describe('API Route: /api/ansettelsesforhold', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  const ORIGINAL_ENV = process.env;

  beforeEach(async () => {
    vi.clearAllMocks();

    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));

    mockReq = {
      method: 'POST',
      headers: {},
      url: '/api/ansettelsesforhold'
    };

    mockRes = {
      status: statusMock,
      json: jsonMock,
      setHeader: vi.fn(),
      end: vi.fn()
    } as any;

    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('Development environment', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'development';
      vi.resetModules();
      const apiModule = await import('../../../pages/api/ansettelsesforhold');
      handler = apiModule.default;
      config = apiModule.config;
    });

    it('returns mock data when mock file exists', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockData) as any);

      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockData);
    });

    it('returns 404 when mock file is missing', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Mock not found' });
    });
  });

  describe('Production environment', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'production';
      process.env.IM_API_URI = 'api.example.com';
      process.env.ARBEIDSFORHOLD_SELVBESTEMT_API = '/ansettelsesforhold';
      vi.resetModules();
      const apiModule = await import('../../../pages/api/ansettelsesforhold');
      handler = apiModule.default;
      config = apiModule.config;
    });

    it('proxies request to backend', () => {
      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockHttpProxyMiddleware).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        expect.objectContaining({
          target: 'http://api.example.com/ansettelsesforhold',
          onProxyInit: mockHandleProxyInit
        })
      );
    });

    it('uses correct proxy configuration', () => {
      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      const proxyConfig = mockHttpProxyMiddleware.mock.calls[0][2];
      expect(proxyConfig.target).toBe('http://api.example.com/ansettelsesforhold');
      expect(proxyConfig.onProxyInit).toBe(mockHandleProxyInit);
      expect(proxyConfig.pathRewrite).toEqual([
        {
          patternStr: '^/api/ansettelsesforhold',
          replaceStr: ''
        }
      ]);
    });

    it('returns proxy middleware result', () => {
      mockHttpProxyMiddleware.mockReturnValue('proxy-result' as any);

      const result = handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result).toBe('proxy-result');
    });
  });

  describe('API Configuration', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'production';
      vi.resetModules();
      const apiModule = await import('../../../pages/api/ansettelsesforhold');
      handler = apiModule.default;
      config = apiModule.config;
    });

    it('has externalResolver enabled', () => {
      expect(config.api.externalResolver).toBe(true);
    });

    it('has bodyParser disabled', () => {
      expect(config.api.bodyParser).toBe(false);
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NextApiRequest, NextApiResponse } from 'next';

// Mock next-http-proxy-middleware
vi.mock('next-http-proxy-middleware', () => ({
  default: vi.fn()
}));

// Mock handleProxyInit
vi.mock('../../../utils/api/handleProxyInit', () => ({
  default: vi.fn()
}));

// Import after mocks are set up
import httpProxyMiddleware from 'next-http-proxy-middleware';
import handleProxyInit from '../../../utils/api/handleProxyInit';
import org from '../../../mockdata/blank-to-arbaidsforhold.json';

const mockHttpProxyMiddleware = vi.mocked(httpProxyMiddleware);
const mockHandleProxyInit = vi.mocked(handleProxyInit);

// Need to dynamically import handler to respect environment variables
let handler: any;
let config: any;

describe('API Route: /api/aktiveorgnr', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  const ORIGINAL_ENV = process.env;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));

    mockReq = {
      method: 'GET',
      headers: {},
      url: '/api/aktiveorgnr'
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
    vi.useRealTimers();
    process.env = ORIGINAL_ENV;
  });

  describe('Development environment', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'development';
      vi.resetModules();
      const apiModule = await import('../../../pages/api/aktiveorgnr');
      handler = apiModule.default;
      config = apiModule.config;
    });

    it('should return mock data after 500ms delay', async () => {
      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(jsonMock).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(500);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(org);
    });

    it('should not respond before timeout completes', async () => {
      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      await vi.advanceTimersByTimeAsync(400);

      expect(jsonMock).not.toHaveBeenCalled();
    });

    it('should respond after exactly 500ms', async () => {
      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      await vi.advanceTimersByTimeAsync(499);
      expect(jsonMock).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect(jsonMock).toHaveBeenCalled();
    });

    it('should return correct mock data structure', async () => {
      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      await vi.advanceTimersByTimeAsync(500);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          fulltNavn: expect.any(String),
          underenheter: expect.any(Array)
        })
      );
    });

    it('should handle multiple concurrent requests', async () => {
      const jsonMock2 = vi.fn();
      const statusMock2 = vi.fn(() => ({ json: jsonMock2 }));
      const mockRes2 = {
        status: statusMock2,
        json: jsonMock2
      } as any;

      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);
      handler(mockReq as NextApiRequest, mockRes2 as NextApiResponse);

      await vi.advanceTimersByTimeAsync(500);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(statusMock2).toHaveBeenCalledWith(200);
    });

    it('should return data matching imported mock', async () => {
      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      await vi.advanceTimersByTimeAsync(500);

      expect(jsonMock).toHaveBeenCalledWith(org);
      expect(jsonMock.mock.calls[0][0]).toEqual(org);
    });

    it('should handle POST requests', async () => {
      mockReq.method = 'POST';

      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      await vi.advanceTimersByTimeAsync(500);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(org);
    });

    it('should return undefined (setTimeout does not return response)', () => {
      const result = handler(mockReq as NextApiRequest, mockRes as NextApiResponse);
      expect(result).toBeUndefined();
    });
  });

  describe('Production environment', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'production';
      process.env.IM_API_URI = 'api.example.com';
      process.env.AKTIVE_ORGNR_API = '/aktive-orgnr';
      vi.resetModules();
      const apiModule = await import('../../../pages/api/aktiveorgnr');
      handler = apiModule.default;
      config = apiModule.config;
    });

    it('should proxy request to backend', () => {
      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockHttpProxyMiddleware).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        expect.objectContaining({
          target: 'http://api.example.com/aktive-orgnr',
          onProxyInit: mockHandleProxyInit
        })
      );
    });

    it('should use correct proxy configuration', () => {
      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      const proxyConfig = mockHttpProxyMiddleware.mock.calls[0][2];

      expect(proxyConfig.target).toBe('http://api.example.com/aktive-orgnr');
      expect(proxyConfig.onProxyInit).toBe(mockHandleProxyInit);
      expect(proxyConfig.pathRewrite).toEqual([
        {
          patternStr: '^/api/aktiveorgnr',
          replaceStr: ''
        }
      ]);
    });

    it('should rewrite path correctly', () => {
      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      const proxyConfig = mockHttpProxyMiddleware.mock.calls[0][2];
      const pathRewrite = proxyConfig.pathRewrite[0];

      expect(pathRewrite.patternStr).toBe('^/api/aktiveorgnr');
      expect(pathRewrite.replaceStr).toBe('');
    });

    it('should call proxy middleware exactly once', () => {
      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockHttpProxyMiddleware).toHaveBeenCalledTimes(1);
    });

    it('should not use setTimeout in production', () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(setTimeoutSpy).not.toHaveBeenCalled();

      setTimeoutSpy.mockRestore();
    });

    it('should pass request and response to proxy', () => {
      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockHttpProxyMiddleware).toHaveBeenCalledWith(mockReq, mockRes, expect.any(Object));
    });

    it('should construct basePath from environment variables', async () => {
      process.env.IM_API_URI = 'backend.service.local';
      process.env.AKTIVE_ORGNR_API = '/v1/orgnr';

      vi.resetModules();
      const apiModule = await import('../../../pages/api/aktiveorgnr');
      const updatedHandler = apiModule.default;

      updatedHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      const proxyConfig = mockHttpProxyMiddleware.mock.calls[0][2];
      expect(proxyConfig.target).toBe('http://backend.service.local/v1/orgnr');
    });

    it('should handle POST requests', () => {
      mockReq.method = 'POST';

      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockHttpProxyMiddleware).toHaveBeenCalled();
    });

    it('should return result of proxy middleware', () => {
      mockHttpProxyMiddleware.mockReturnValue('proxy-result' as any);

      const result = handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result).toBe('proxy-result');
    });
  });

  describe('API Configuration', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'production';
      vi.resetModules();
      const apiModule = await import('../../../pages/api/aktiveorgnr');
      handler = apiModule.default;
      config = apiModule.config;
    });

    it('should have externalResolver enabled', () => {
      expect(config.api.externalResolver).toBe(true);
    });

    it('should have bodyParser disabled', () => {
      expect(config.api.bodyParser).toBe(false);
    });

    it('should export config object', () => {
      expect(config).toBeDefined();
      expect(config.api).toBeDefined();
    });
  });

  describe('Environment edge cases', () => {
    it('should handle undefined NODE_ENV', async () => {
      delete process.env.NODE_ENV;
      vi.resetModules();
      const apiModule = await import('../../../pages/api/aktiveorgnr');
      const testHandler = apiModule.default;

      testHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(mockHttpProxyMiddleware).not.toHaveBeenCalled();
    });

    it('should handle test environment', async () => {
      process.env.NODE_ENV = 'test';
      vi.resetModules();
      const apiModule = await import('../../../pages/api/aktiveorgnr');
      const testHandler = apiModule.default;

      testHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(mockHttpProxyMiddleware).not.toHaveBeenCalled();
    });

    it('should be case-sensitive for environment check', async () => {
      process.env.NODE_ENV = 'Development';
      vi.resetModules();
      const apiModule = await import('../../../pages/api/aktiveorgnr');
      const testHandler = apiModule.default;

      testHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(mockHttpProxyMiddleware).not.toHaveBeenCalled();
    });
  });

  describe('Request handling', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'production';
      process.env.IM_API_URI = 'api.example.com';
      process.env.AKTIVE_ORGNR_API = '/aktive-orgnr';
      vi.resetModules();
      const apiModule = await import('../../../pages/api/aktiveorgnr');
      handler = apiModule.default;
    });

    it('should handle requests with headers in production', () => {
      mockReq.headers = {
        Authorization: 'Bearer token123',
        'Content-Type': 'application/json'
      };

      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockHttpProxyMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token123'
          })
        }),
        mockRes,
        expect.any(Object)
      );
    });

    it('should handle requests with query parameters', () => {
      mockReq.url = '/api/aktiveorgnr?filter=active';

      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockHttpProxyMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/aktiveorgnr?filter=active'
        }),
        mockRes,
        expect.any(Object)
      );
    });
  });

  describe('Proxy configuration details', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'production';
      process.env.IM_API_URI = 'api.example.com';
      process.env.AKTIVE_ORGNR_API = '/aktive-orgnr';
      vi.resetModules();
      const apiModule = await import('../../../pages/api/aktiveorgnr');
      handler = apiModule.default;
    });

    it('should have pathRewrite as array with single element', () => {
      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      const proxyConfig = mockHttpProxyMiddleware.mock.calls[0][2];
      expect(Array.isArray(proxyConfig.pathRewrite)).toBe(true);
      expect(proxyConfig.pathRewrite).toHaveLength(1);
    });

    it('should remove /api/aktiveorgnr prefix from path', () => {
      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      const proxyConfig = mockHttpProxyMiddleware.mock.calls[0][2];
      const rewrite = proxyConfig.pathRewrite[0];

      const testPath = '/api/aktiveorgnr/test';
      const pattern = new RegExp(rewrite.patternStr);
      const rewrittenPath = testPath.replace(pattern, rewrite.replaceStr);

      expect(rewrittenPath).toBe('/test');
    });

    it('should construct target URL with http protocol', () => {
      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      const proxyConfig = mockHttpProxyMiddleware.mock.calls[0][2];
      expect(proxyConfig.target).toMatch(/^http:\/\//);
    });

    it('should include onProxyInit handler', () => {
      handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      const proxyConfig = mockHttpProxyMiddleware.mock.calls[0][2];
      expect(proxyConfig.onProxyInit).toBe(mockHandleProxyInit);
    });
  });

  describe('Return value handling', () => {
    it('should return undefined when no environment matches', async () => {
      process.env.NODE_ENV = 'test';
      vi.resetModules();
      const apiModule = await import('../../../pages/api/aktiveorgnr');
      const testHandler = apiModule.default;

      const result = testHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result).toBeUndefined();
    });
  });
});

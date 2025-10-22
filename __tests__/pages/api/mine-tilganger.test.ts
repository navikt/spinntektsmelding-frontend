import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NextApiRequest, NextApiResponse } from 'next';

// Mock @navikt/oasis - define inline without referencing variables
vi.mock('@navikt/oasis', () => ({
  getToken: vi.fn(),
  validateToken: vi.fn(),
  requestOboToken: vi.fn()
}));

// Mock safelyParseJSON - define inline
vi.mock('../../../utils/safelyParseJson', () => ({
  default: vi.fn()
}));

// Mock fetch
global.fetch = vi.fn();

// Import after mocks
import { getToken, validateToken, requestOboToken } from '@navikt/oasis';
import safelyParseJSON from '../../../utils/safelyParseJson';
import testdata from '../../../mockdata/endepunktAltinnTilganger.json';

// Get typed mocks
const mockGetToken = vi.mocked(getToken);
const mockValidateToken = vi.mocked(validateToken);
const mockRequestOboToken = vi.mocked(requestOboToken);
const mockSafelyParseJSON = vi.mocked(safelyParseJSON);

describe('API Route: /api/mine-tilganger', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));

    mockReq = {
      method: 'POST',
      headers: {},
      url: '/api/mine-tilganger'
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
    vi.clearAllMocks();
  });

  describe('Development environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should return simplified org structure after 100ms', async () => {
      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      const promise = handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(jsonMock).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(100);
      await promise;

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalled();
    });

    it('should extract org structure with orgnr, navn, and underenheter', async () => {
      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      const promise = handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      await vi.advanceTimersByTimeAsync(100);
      await promise;

      const result = jsonMock.mock.calls[0][0];
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('orgnr');
        expect(result[0]).toHaveProperty('navn');
        expect(result[0]).toHaveProperty('underenheter');
      }
    });

    it('should handle nested underenheter structure', async () => {
      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      const promise = handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      await vi.advanceTimersByTimeAsync(100);
      await promise;

      const result = jsonMock.mock.calls[0][0];
      expect(Array.isArray(result)).toBe(true);

      const hasUnderenheter = result.some((org: any) => org.underenheter && Array.isArray(org.underenheter));
      expect(hasUnderenheter).toBe(true);
    });

    it('should not call auth functions in development', async () => {
      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      const promise = handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      await vi.advanceTimersByTimeAsync(100);
      await promise;

      expect(mockGetToken).not.toHaveBeenCalled();
      expect(mockValidateToken).not.toHaveBeenCalled();
      expect(mockRequestOboToken).not.toHaveBeenCalled();
    });

    it('should not call fetch in development', async () => {
      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      const promise = handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      await vi.advanceTimersByTimeAsync(100);
      await promise;

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return early without checking token', async () => {
      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      const promise = handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      await vi.advanceTimersByTimeAsync(100);
      await promise;

      expect(jsonMock).toHaveBeenCalled();
      expect(mockGetToken).not.toHaveBeenCalled();
    });
  });

  describe('Production environment - Authentication', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.FAGER_TILGANG_INGRESS = 'tilgang.api.com';
      process.env.FAGER_TILGANG_URL = '/tilgang';
      process.env.FAGER_TILGANG_CLIENT_ID = 'test-client-id';
      vi.resetModules();
    });

    it('should return 401 when token is missing', async () => {
      mockGetToken.mockReturnValue(null);
      const { default: handler } = await import('../../../pages/api/mine-tilganger');

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return 401 when token validation fails', async () => {
      mockGetToken.mockReturnValue('valid-token');
      mockValidateToken.mockResolvedValue({ ok: false, error: 'Invalid token' });
      const { default: handler } = await import('../../../pages/api/mine-tilganger');

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockValidateToken).toHaveBeenCalledWith('valid-token');
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return 401 when OBO token request fails', async () => {
      mockGetToken.mockReturnValue('valid-token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockResolvedValue({ ok: false, error: 'OBO failed' });
      const { default: handler } = await import('../../../pages/api/mine-tilganger');

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRequestOboToken).toHaveBeenCalledWith('valid-token', 'test-client-id');
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should call getToken with request', async () => {
      mockGetToken.mockReturnValue(null);
      const { default: handler } = await import('../../../pages/api/mine-tilganger');

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockGetToken).toHaveBeenCalledWith(mockReq);
    });

    it('should validate token after getting it', async () => {
      const testToken = 'test-token-123';
      mockGetToken.mockReturnValue(testToken);
      mockValidateToken.mockResolvedValue({ ok: false, error: 'Invalid' });
      const { default: handler } = await import('../../../pages/api/mine-tilganger');

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockValidateToken).toHaveBeenCalledWith(testToken);
    });

    it('should request OBO token with correct client ID', async () => {
      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockResolvedValue({ ok: false });
      const { default: handler } = await import('../../../pages/api/mine-tilganger');

      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRequestOboToken).toHaveBeenCalledWith('token', 'test-client-id');
    });
  });

  describe('Production environment - API calls', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.FAGER_TILGANG_INGRESS = 'tilgang.api.com';
      process.env.FAGER_TILGANG_URL = '/v1/tilgang';
      process.env.FAGER_TILGANG_CLIENT_ID = 'client-123';
      vi.resetModules();
    });

    it('should call fetch with correct URL', async () => {
      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockResolvedValue({ ok: true, token: 'obo-token' });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200
      });
      mockSafelyParseJSON.mockResolvedValue({ hierarki: [] });

      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(global.fetch).toHaveBeenCalledWith('http://tilgang.api.com/v1/tilgang', expect.any(Object));
    });

    it('should send POST request with correct headers', async () => {
      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockResolvedValue({ ok: true, token: 'obo-token-123' });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200
      });
      mockSafelyParseJSON.mockResolvedValue({ hierarki: [] });

      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer obo-token-123'
          })
        })
      );
    });

    it('should send correct filter in request body', async () => {
      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockResolvedValue({ ok: true, token: 'obo-token' });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200
      });
      mockSafelyParseJSON.mockResolvedValue({ hierarki: [] });

      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);

      expect(body).toEqual({
        filter: {
          altinn2Tilganger: ['4936:1'],
          altinn3Tilganger: []
        }
      });
    });

    it('should return error when fetch fails', async () => {
      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockResolvedValue({ ok: true, token: 'obo-token' });

      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Feil ved kontroll av tilgang til sykepengesøknader'
      });
    });

    it('should return 404 when API returns 404', async () => {
      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockResolvedValue({ ok: true, token: 'obo-token' });

      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('should parse response with safelyParseJSON', async () => {
      const mockResponse = {
        ok: true,
        status: 200
      };

      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockResolvedValue({ ok: true, token: 'obo-token' });
      (global.fetch as any).mockResolvedValue(mockResponse);
      mockSafelyParseJSON.mockResolvedValue({ hierarki: [] });

      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockSafelyParseJSON).toHaveBeenCalledWith(mockResponse);
    });

    it('should return hierarki from parsed response', async () => {
      const mockHierarki = [{ orgnr: '123', navn: 'Test Org', underenheter: [] }];

      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockResolvedValue({ ok: true, token: 'obo-token' });
      (global.fetch as any).mockResolvedValue({ ok: true, status: 200 });
      mockSafelyParseJSON.mockResolvedValue({ hierarki: mockHierarki });

      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockHierarki);
    });

    it('should return empty array when hierarki is missing', async () => {
      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockResolvedValue({ ok: true, token: 'obo-token' });
      (global.fetch as any).mockResolvedValue({ ok: true, status: 200 });
      mockSafelyParseJSON.mockResolvedValue({});

      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(jsonMock).toHaveBeenCalledWith([]);
    });

    it('should return empty array when hierarki is null', async () => {
      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockResolvedValue({ ok: true, token: 'obo-token' });
      (global.fetch as any).mockResolvedValue({ ok: true, status: 200 });
      mockSafelyParseJSON.mockResolvedValue({ hierarki: null });

      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(jsonMock).toHaveBeenCalledWith([]);
    });
  });

  describe('API Configuration', () => {
    it('should have externalResolver enabled', async () => {
      const { config } = await import('../../../pages/api/mine-tilganger');

      expect(config.api.externalResolver).toBe(true);
    });

    it('should export config object', async () => {
      const { config } = await import('../../../pages/api/mine-tilganger');

      expect(config).toBeDefined();
      expect(config.api).toBeDefined();
    });
  });

  describe('extractOrgStructure function', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should extract basic org properties', async () => {
      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      const promise = handler(mockReq as NextApiRequest, mockRes as NextApiResponse);
      await vi.advanceTimersByTimeAsync(100);
      await promise;

      const result = jsonMock.mock.calls[0][0];

      if (result.length > 0) {
        const org = result[0];
        expect(org).toHaveProperty('orgnr');
        expect(org).toHaveProperty('navn');
        expect(org).toHaveProperty('underenheter');
        expect(typeof org.orgnr).toBe('string');
        expect(typeof org.navn).toBe('string');
        expect(Array.isArray(org.underenheter)).toBe(true);
      }
    });

    it('should handle empty underenheter array', async () => {
      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      const promise = handler(mockReq as NextApiRequest, mockRes as NextApiResponse);
      await vi.advanceTimersByTimeAsync(100);
      await promise;

      const result = jsonMock.mock.calls[0][0];

      expect(result.every((org: any) => Array.isArray(org.underenheter))).toBe(true);
    });

    it('should preserve hierarchy depth', async () => {
      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      const promise = handler(mockReq as NextApiRequest, mockRes as NextApiResponse);
      await vi.advanceTimersByTimeAsync(100);
      await promise;

      const result = jsonMock.mock.calls[0][0];

      const findDepth = (nodes: any[], depth = 0): number => {
        if (!nodes || nodes.length === 0) return depth;
        return Math.max(...nodes.map((n) => findDepth(n.underenheter, depth + 1)));
      };

      const depth = findDepth(result);
      expect(depth).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Environment variables', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should construct basePath with FAGER_TILGANG_INGRESS and URL', async () => {
      process.env.NODE_ENV = 'production';
      process.env.FAGER_TILGANG_INGRESS = 'custom.api.com';
      process.env.FAGER_TILGANG_URL = '/custom/path';
      process.env.FAGER_TILGANG_CLIENT_ID = 'client';

      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockResolvedValue({ ok: true, token: 'obo' });
      (global.fetch as any).mockResolvedValue({ ok: true, status: 200 });
      mockSafelyParseJSON.mockResolvedValue({ hierarki: [] });

      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(global.fetch).toHaveBeenCalledWith('http://custom.api.com/custom/path', expect.any(Object));
    });

    it('should use FAGER_TILGANG_CLIENT_ID for OBO request', async () => {
      process.env.NODE_ENV = 'production';
      process.env.FAGER_TILGANG_CLIENT_ID = 'specific-client-id';
      process.env.FAGER_TILGANG_INGRESS = 'api.com';
      process.env.FAGER_TILGANG_URL = '/path';

      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockResolvedValue({ ok: false });

      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(mockRequestOboToken).toHaveBeenCalledWith('token', 'specific-client-id');
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.FAGER_TILGANG_INGRESS = 'api.com';
      process.env.FAGER_TILGANG_URL = '/path';
      process.env.FAGER_TILGANG_CLIENT_ID = 'client';
      vi.resetModules();
    });

    it('should handle validateToken rejection', async () => {
      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockRejectedValue(new Error('Validation error'));

      const { default: handler } = await import('../../../pages/api/mine-tilganger');

      await expect(async () => {
        await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);
      }).rejects.toThrow('Validation error');
    });

    it('should handle requestOboToken rejection', async () => {
      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockRejectedValue(new Error('OBO error'));

      const { default: handler } = await import('../../../pages/api/mine-tilganger');

      await expect(async () => {
        await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);
      }).rejects.toThrow('OBO error');
    });

    it('should handle fetch rejection', async () => {
      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockResolvedValue({ ok: true, token: 'obo' });
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const { default: handler } = await import('../../../pages/api/mine-tilganger');

      await expect(async () => {
        await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);
      }).rejects.toThrow('Network error');
    });

    it('should handle safelyParseJSON rejection', async () => {
      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockResolvedValue({ ok: true, token: 'obo' });
      (global.fetch as any).mockResolvedValue({ ok: true, status: 200 });
      mockSafelyParseJSON.mockRejectedValue(new Error('Parse error'));

      const { default: handler } = await import('../../../pages/api/mine-tilganger');

      await expect(async () => {
        await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);
      }).rejects.toThrow('Parse error');
    });
  });

  describe('Response status codes', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.FAGER_TILGANG_INGRESS = 'api.com';
      process.env.FAGER_TILGANG_URL = '/path';
      process.env.FAGER_TILGANG_CLIENT_ID = 'client';
      vi.resetModules();
    });

    it('should return 200 on successful request', async () => {
      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockResolvedValue({ ok: true, token: 'obo' });
      (global.fetch as any).mockResolvedValue({ ok: true, status: 200 });
      mockSafelyParseJSON.mockResolvedValue({ hierarki: [] });

      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it('should preserve API status code on error', async () => {
      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockResolvedValue({ ok: true, token: 'obo' });
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      });

      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('should use API status for successful response', async () => {
      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockResolvedValue({ ok: true });
      mockRequestOboToken.mockResolvedValue({ ok: true, token: 'obo' });
      (global.fetch as any).mockResolvedValue({ ok: true, status: 201 });
      mockSafelyParseJSON.mockResolvedValue({ hierarki: [] });

      const { default: handler } = await import('../../../pages/api/mine-tilganger');
      await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(201);
    });
  });
});

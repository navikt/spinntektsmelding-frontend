import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import handleProxyInit from '../../utils/api/handleProxyInit';

export interface CreateProxyHandlerOptions<T> {
  /** Base target URL (no trailing slash) */
  target: string;
  /** API route prefix to strip, e.g. /api/arbeidsgivere */
  routePrefix: string;
  /** Dev mock payload */
  devMock: () => T;
  /** Optional flag if bodyParser should be disabled (default true) */
  disableBodyParser?: boolean;
}

/**
 * Lightweight proxy route factory aligning with createHandler philosophy but
 * keeping streaming support via next-http-proxy-middleware. Authentication is
 * assumed to be handled upstream (either by ingress or by the downstream service).
 */
export function createProxyHandler<T>(options: CreateProxyHandlerOptions<T>) {
  const { target, routePrefix, devMock } = options;
  return function handler(req: NextApiRequest, res: NextApiResponse<T>) {
    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json(devMock());
    }
    // Production: forward
    return httpProxyMiddleware(req, res, {
      target,
      onProxyInit: handleProxyInit,
      pathRewrite: [
        {
          patternStr: `^${routePrefix}`,
          replaceStr: ''
        }
      ]
    });
  };
}

// Export Next.js route config convenience
export const proxyRouteConfig = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};

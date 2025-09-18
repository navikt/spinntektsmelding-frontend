import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiError, extractAndValidateToken, getObo } from '../auth/token';

interface HandlerConfig<I = any, O = any> {
  devMock?: () => O | Promise<O>;
  devStatus?: number; // custom HTTP status in development when devMock is used
  requireAuth?: boolean;
  oboClientId?: string;
  validateBody?: (body: unknown) => asserts body is I;
  action: (ctx: { req: NextApiRequest; body: I; token?: string; oboToken?: string }) => Promise<O> | O;
  transformResponse?: (output: O) => any;
  allowedMethods?: string[];
  successStatus?: number; // override default 200 on success
}

export function createHandler<I, O>(config: HandlerConfig<I, O>) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (config.allowedMethods && !config.allowedMethods.includes(req.method || '')) {
        res.setHeader('Allow', config.allowedMethods.join(', '));
        return res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
      }

      if (process.env.NODE_ENV === 'development' && config.devMock) {
        const mock = await config.devMock();
        return res.status(config.devStatus || 200).json(mock);
      }

      let token: string | undefined;
      if (config.requireAuth) {
        const auth = await extractAndValidateToken(req);
        token = auth.token;
      }

      let oboToken: string | undefined;
      if (config.oboClientId && token) {
        const obo = await getObo(token, config.oboClientId);
        oboToken = obo.oboToken;
      }

      const bodyRaw = req.body;
      if (config.validateBody) {
        // Cast to explicit type to satisfy TS assertion requirements inside generic factory
        const validate: (body: unknown) => asserts body is I = config.validateBody;
        validate(bodyRaw);
      }
      const body = bodyRaw as I;

      const output: any = await config.action({ req, body, token, oboToken });

      // Support utvidet retur-format for å kunne sette status og headers fra action
      // Konvensjon: action kan returnere et objekt med felt __status, __headers, __body
      // Disse er "meta" og fjernes fra selve payload før vi responderer.
      let status = config.successStatus || 200;
      let headers: Record<string, string> | undefined;
      let payload: any = output;
      if (output && typeof output === 'object') {
        const maybe = output as any;
        const hasMeta = '__status' in maybe || '__headers' in maybe || '__body' in maybe;
        if (hasMeta) {
          if (maybe.__status) status = maybe.__status;
          if (maybe.__headers) headers = maybe.__headers;
          if ('__body' in maybe) payload = maybe.__body; // kan være undefined hvis tom body er ønsket
        }
      }

      const responsePayload = config.transformResponse ? config.transformResponse(payload) : payload;

      if (headers) {
        Object.entries(headers).forEach(([k, v]) => {
          if (typeof v === 'string') {
            try {
              res.setHeader(k, v);
            } catch (_) {
              /* ignorer header-set feil */
            }
          }
        });
      }

      // Hvis vi eksplisitt har Content-Type og payload er en string som ikke er JSON, bruk send
      const explicitContentType = headers && Object.keys(headers).some((h) => h.toLowerCase() === 'content-type');
      if (explicitContentType && typeof responsePayload === 'string') {
        return res.status(status).send(responsePayload);
      }
      return res.status(status).json(responsePayload);
    } catch (e: any) {
      if (e instanceof ApiError) {
        return res.status(e.status).json({ error: { code: e.code, message: e.message, details: e.details } });
      }
      console.warn('Uventet feil i handler', e);
      return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Uventet feil' } });
    }
  };
}

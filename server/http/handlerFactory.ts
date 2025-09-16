import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiError, extractAndValidateToken, getObo } from '../auth/token';

export interface HandlerConfig<I = any, O = any> {
  devMock?: () => O | Promise<O>;
  requireAuth?: boolean;
  oboClientId?: string;
  validateBody?: (body: unknown) => asserts body is I;
  action: (ctx: { req: NextApiRequest; body: I; token?: string; oboToken?: string }) => Promise<O> | O;
  transformResponse?: (output: O) => any;
  allowedMethods?: string[];
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
        return res.status(200).json(mock);
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

      const output = await config.action({ req, body, token, oboToken });
      const responsePayload = config.transformResponse ? config.transformResponse(output) : output;
      return res.status(200).json(responsePayload);
    } catch (e: any) {
      if (e instanceof ApiError) {
        return res.status(e.status).json({ error: { code: e.code, message: e.message, details: e.details } });
      }
      console.error('Uventet feil i handler', e);
      return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Uventet feil' } });
    }
  };
}

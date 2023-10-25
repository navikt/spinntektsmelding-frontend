import { logger } from '@navikt/next-logger';
import { NextApiRequest, NextApiResponse } from 'next';

import { verifyIdportenAccessToken } from './verifyIdportenAccessToken';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>;

export function beskyttetApi(handler: ApiHandler): ApiHandler {
  return async function withBearerTokenHandler(req, res) {
    function send401() {
      res.status(401).json({ message: 'Access denied' });
    }

    const bearerToken: string | null | undefined = req.headers['authorization'];
    if (!bearerToken) {
      return send401();
    }
    try {
      await verifyIdportenAccessToken(bearerToken);
    } catch (e) {
      logger.warn(`Kunne ikke validere token fra ID-porten i beskyttetApi. Error: ${e}.`);
      return send401();
    }

    return handler(req, res);
  };
}

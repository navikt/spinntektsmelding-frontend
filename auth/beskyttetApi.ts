import { logger } from '@navikt/next-logger';
import { NextApiRequest, NextApiResponse } from 'next';

// import metrics, { cleanPathForMetric } from '../metrics';
// import { isMockBackend } from '../utils/environment';
// import { mockApi } from '../data/mock/mock-api';

import { verifyIdportenAccessToken } from './verifyIdportenAccessToken';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>;

export function beskyttetApi(handler: ApiHandler): ApiHandler {
  return async function withBearerTokenHandler(req, res) {
    // const cleanPath = cleanPathForMetric(req.url!);

    function send401() {
      // metrics.apiUnauthorized.inc({ path: cleanPath }, 1);

      res.status(401).json({ message: 'Access denied' });
    }

    // if (isMockBackend()) {
    //   return mockApi(req, res);
    // }

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
    // metrics.apiAuthorized.inc({ path: cleanPath }, 1);
    return handler(req, res);
  };
}

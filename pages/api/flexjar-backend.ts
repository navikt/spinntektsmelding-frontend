// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';

import handleProxyInit from '../../utils/api/handleProxyInit';
import { getToken, requestOboToken, validateToken } from '@navikt/oasis';
import { logger } from '@navikt/next-logger';
import { requireEnv } from '../../utils/api/validateEnv';

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse<unknown>) => {
  const env = process.env.NODE_ENV;
  if (env === 'development') {
    setTimeout(() => {
      return res.status(201).end();
    }, 100);
  } else if (env === 'production') {
    try {
      const token = getToken(req);
      if (!token) {
        /* håndter manglende token */
        logger.info('Mangler token i header');
        return res.status(401);
      }

      const validation = await validateToken(token);
      if (!validation.ok) {
        logger.info('Validering feilet: ' + JSON.stringify(validation.error));
        return res.status(401);
      }

      const basePath = 'http://' + requireEnv('FLEXJAR_URL') + '/api/v1/feedback';
      const clientId = requireEnv('FLEXJAR_BACKEND_CLIENT_ID');
      const obo = await requestOboToken(token, clientId);
      if (!obo.ok) {
        /* håndter obo-feil */
        logger.info('OBO-feil: ' + JSON.stringify(obo.error));
        return res.status(401);
      }

      return httpProxyMiddleware(req, res, {
        target: basePath,
        onProxyInit: handleProxyInit,
        headers: { Authorization: `bearer ${obo.token}` },
        pathRewrite: [
          {
            patternStr: '^/api/flexjar-backend',
            replaceStr: ''
          }
        ]
      });
    } catch (error) {
      console.error('Missing required environment variables:', error);
      return res.status(500).json({ error: 'Server configuration error' });
    }
  } else {
    return res.status(500).json({ error: 'Invalid NODE_ENV' });
  }
};

export default handler;

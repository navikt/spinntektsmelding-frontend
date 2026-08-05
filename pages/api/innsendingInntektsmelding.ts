// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';

import handleProxyInit from '../../utils/api/handleProxyInit';
import { requireEnv } from '../../utils/api/validateEnv';

type FeilRespons = { valideringsfeil: string[]; error: string } | { status: 'OK' };

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse<FeilRespons>) => {
  const env = process.env.NODE_ENV;
  if (env === 'development') {
    setTimeout(() => {
      return res.status(201).json({
        status: 'OK'
      });
    }, 100);
  } else if (env === 'production') {
    try {
      const basePath = 'http://' + requireEnv('IM_API_URI') + requireEnv('INNSENDING_INNTEKTSMELDING_API');
      return httpProxyMiddleware(req, res, {
        target: basePath,
        onProxyInit: handleProxyInit,
        pathRewrite: [
          {
            patternStr: '^/api/innsendingInntektsmelding',
            replaceStr: ''
          }
        ]
      });
    } catch (error) {
      console.error('Missing required environment variables:', error);
      return res.status(500).json({ error: 'Server configuration error', valideringsfeil: [] });
    }
  } else {
    return res.status(500).json({ error: 'Invalid NODE_ENV', valideringsfeil: [] });
  }
};

export default handler;

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';

import feilRespons from '../../mockdata/respons-backendfeil.json';
import handleProxyInit from '../../utils/api/handleProxyInit';

const basePath = 'http://' + global.process.env.IM_API_URI + process.env.INNSENDING_INNTEKTSMELDING_API;

type FeilRespons = { valideringsfeil: string[]; error: string };

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse<FeilRespons>) => {
  const env = process.env.NODE_ENV;
  if (env == 'development') {
    setTimeout(() => {
      return res.status(201).json(feilRespons);
    }, 100);
  } else if (env == 'production') {
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
  }
};

export default handler;

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import environment from '../../../config/environment';

import org from '../../../mockdata/trenger-originalen.json';
import handleProxyInit from '../../../utils/api/handleProxyInit';

const basePath = 'http://' + global.process.env.IM_API_URI + environment.inntektsmeldingUuidAPI;

type Data = typeof org;

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const env = process.env.NODE_ENV;
  if (env == 'development') {
    setTimeout(() => {
      return res.status(200).json(org);
    }, 5);
  } else if (env == 'production') {
    return httpProxyMiddleware(req, res, {
      target: basePath,
      onProxyInit: handleProxyInit,
      pathRewrite: [
        {
          patternStr: '^/api/hent-forespoersel',
          replaceStr: ''
        }
      ]
    });
  }
};

export default handler;

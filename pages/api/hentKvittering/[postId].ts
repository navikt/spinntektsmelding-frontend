// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import environment from '../../../config/environment';
import handleProxyInit from '../../../utils/api/handleProxyInit';
import org from '../../../mockdata/kvittering-ferie.json';
import { apiConfig } from '../../../utils/api/apiConfig';

const basePath = environment.hentKvitteringAPI;

type Data = typeof org;

export const config = apiConfig;

const handler = (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const env = process.env.NODE_ENV;
  if (env == 'development') {
    return res.status(200).json(org);
  } else if (env == 'production') {
    return httpProxyMiddleware(req, res, {
      target: basePath,
      onProxyInit: handleProxyInit,
      pathRewrite: [
        {
          patternStr: '^/api/hentKvittering/',
          replaceStr: ''
        }
      ]
    });
  }
};

export default handler;

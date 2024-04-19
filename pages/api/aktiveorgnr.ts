// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import environment from '../../config/environment';

import org from '../../mockdata/blank.json';
import handleProxyInit from '../../utils/api/handleProxyInit';
import { a } from 'vitest/dist/suite-ynYMzeLu';

const basePath = environment.aktiveOrgnrApi;

type Data = typeof org;

export const config = apiConfig;

const handler = (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const env = process.env.NODE_ENV;
  if (env == 'development') {
    setTimeout(() => {
      return res.status(200).json(org);
    }, 500);
  } else if (env == 'production') {
    return httpProxyMiddleware(req, res, {
      target: basePath,
      onProxyInit: handleProxyInit,
      pathRewrite: [
        {
          patternStr: '^/api/aktiveorgnr',
          replaceStr: ''
        }
      ]
    });
  }
};

export default handler;

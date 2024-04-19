// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import environment from '../../../config/environment';

import org from '../../../mockdata/testOrganisasjoner';
import handleProxyInit from '../../../utils/api/handleProxyInit';
import { apiConfig } from '../../../utils/api/apiConfig';

const basePath = environment.innsendingInntektsmeldingAPI;

type Data = typeof org;

export const config = apiConfig;

const handler = (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const env = process.env.NODE_ENV;
  if (env == 'development') {
    const innsendteData = {
      errors: [{ property: 'refusjon.refusjonPrMnd', error: 'Must be less than or equal to 40 000', value: '45000.0' }]
    };
    setTimeout(() => {
      return res.status(201).json(innsendteData);
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

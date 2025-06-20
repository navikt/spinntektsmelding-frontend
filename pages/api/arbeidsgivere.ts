// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import environment from '../../config/environment';

import org from '../../mockdata/testOrganisasjoner';
import handleProxyInit from '../../utils/api/handleProxyInit';
import { MottattArbeidsgiver } from '../../schema/MottattArbeidsgiverSchema';

const basePath = 'http://' + global.process.env.IM_API_URI + environment.arbeidsgiverAPI;

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse<MottattArbeidsgiver[]>) => {
  const env = process.env.NODE_ENV;
  if (env == 'development') {
    return res.status(200).json(org);
  } else if (env == 'production') {
    return httpProxyMiddleware(req, res, {
      target: basePath,
      onProxyInit: handleProxyInit,
      pathRewrite: [
        {
          patternStr: '^/api/arbeidsgivere',
          replaceStr: ''
        }
      ]
    });
  }
};

export default handler;

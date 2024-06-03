// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import environment from '../../config/environment';

import org from '../../mockdata/inntektData.json';
import handleProxyInit from '../../utils/api/handleProxyInit';

const basePath = 'http://' + global.process.env.IM_API_URI + environment.inntektsdataSelvbestemtAPI;

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
    return res.status(200).json(org);
  } else if (env == 'production') {
    return httpProxyMiddleware(req, res, {
      target: basePath,
      onProxyInit: handleProxyInit,
      pathRewrite: [
        {
          patternStr: '^/api/inntekt-selvbestemt',
          replaceStr: ''
        }
      ]
    });
  }
};

export default handler;

('Error 500: io.ktor.server.plugins.BadRequestException: Failed to convert request body to class no.nav.helsearbeidsgiver.inntektsmelding.api.inntekt.InntektRequest');

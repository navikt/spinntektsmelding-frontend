// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';

import handleProxyInit from '../../utils/api/handleProxyInit';
import { getToken, requestOboToken, validateToken } from '@navikt/oasis';

import testdata from '../../mockdata/sp-soeknad.json';

const basePath =
  'http://' + global.process.env.FLEX_SYKEPENGESOEKNAD_INGRESS + global.process.env.FLEX_SYKEPENGESOEKNAD_URL;

const authApi = 'http://' + global.process.env.IM_API_URI + global.process.env.AUTH_SYKEPENGESOEKNAD_API;

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse<unknown>) => {
  const env = process.env.NODE_ENV;
  if (env == 'development') {
    setTimeout(() => {
      return res.status(200).json(testdata);
    }, 100);
  } else if (env == 'production') {
    const token = getToken(req);
    if (!token) {
      /* håndter manglende token */
      console.error('Mangler token i header');
      return res.status(401);
    }

    const validation = await validateToken(token);
    if (!validation.ok) {
      console.log('Validering feilet: ', validation.error);
      return res.status(401);
    }

    const orgnr = req.body.orgnummer;
    console.log('Orgnr: ', orgnr);

    const tokenResponse = await fetch(authApi + '/' + orgnr, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!tokenResponse.ok) {
      console.error('Feil ved kontroll av tilgang: ', tokenResponse.statusText);

      return res.status(tokenResponse.status);
    }

    const obo = await requestOboToken(token, process.env.FLEX_SYKEPENGESOEKNAD_CLIENT_ID!);
    if (!obo.ok) {
      /* håndter obo-feil */
      console.error('OBO-feil: ', obo.error);
      return res.status(401);
    }

    return httpProxyMiddleware(req, res, {
      target: basePath,
      onProxyInit: handleProxyInit,
      headers: { Authorization: `bearer ${obo.token}` },
      pathRewrite: [
        {
          patternStr: '^/api/sp-soeknader',
          replaceStr: ''
        }
      ]
    });
  }
};

export default handler;

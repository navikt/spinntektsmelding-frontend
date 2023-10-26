// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import environment from '../../../config/environment';

import org from '../../../mockdata/testOrganisasjoner';

const basePath = environment.innsendingInntektsmeldingAPI;

type Data = typeof org;

const handleProxyInit = (proxy: any) => {
  /**
   * Check the list of bindable events in the `http-proxy` specification.
   * @see https://www.npmjs.com/package/http-proxy#listening-for-proxy-events
   */
  proxy.on('error', function (err: any, _req: any, res: any) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });

    res.end('Something went wrong. ' + JSON.stringify(err));
  });

  proxy.on('proxyRes', function (proxyRes: any, req: any, res: any) {
    console.log('RAW Response from the target', JSON.stringify(proxyRes.headers));
  });

  proxy.on('proxyReq', function (proxyReq: any, _req: any, _res: any, _options: any) {
    proxyReq.setHeader('cookie', '');
  });
};

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const env = process.env.NODE_ENV;
  if (env == 'development') {
    const innsendteData = {
      errors: [
        {
          property: 'refusjon.refusjonEndringer[0].beløp',
          error: 'Må være større enn 0,0',
          value: '0'
        }
      ]
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

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import environment from '../../config/environment';

import org from '../../mockdata/formData';

const basePath = environment.inntektsmeldingAPI;

type Data = typeof org;

const handleProxyInit = (proxy: any) => {
  /**
   * Check the list of bindable events in the `http-proxy` specification.
   * @see https://www.npmjs.com/package/http-proxy#listening-for-proxy-events
   */
  proxy.on('error', function (_err: any, _req: any, res: any) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });

    res.end('Something went wrong. And we are reporting a custom error message.');
  });

  proxy.on('proxyRes', function (proxyRes: any, req: any, res: any) {
    console.log('RAW Response from the target', JSON.stringify(proxyRes.headers));
  });

  proxy.on('proxyReq', function (proxyReq: any, _req: any, _res: any, _options: any) {
    console.log('RAW Request from the client', JSON.stringify(proxyReq.headers));

    proxyReq.setHeader('cookie', '');
  });
};

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};

const handler = (
  req: NextApiRequest,
  res: NextApiResponse<Data> //res.status(200).json(org);
) => res.status(200).json(org);
// httpProxyMiddleware(req, res, {
//   target: basePath,
//   onProxyInit: handleProxyInit,
//   pathRewrite: [
//     {
//       patternStr: '^/api/inntektsmelding',
//       replaceStr: ''
//     }
//   ]
// });

export default handler;

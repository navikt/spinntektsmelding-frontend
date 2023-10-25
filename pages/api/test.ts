// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import environment from '../../config/environment';

import org from '../../mockdata/testOrganisasjoner';

const basePath = environment.arbeidsgiverAPI;

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
    proxyReq.setHeader('cookie', '');
  });
};

export const config = {
  api: {
    externalResolver: true
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const env = process.env.NODE_ENV;
  if (env == 'development') {
    return res.status(200).json(org);
  } else if (env == 'production') {
    return res.status(200).json(global.process.env.TEST_VAR);
  }
};

export default handler;

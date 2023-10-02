// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import environment from '../../../config/environment';

import org from '../../../mockdata/kvittering-eksternt-system.json';
import { beskyttetApi } from '../../../auth/beskyttetApi';
import { getTokenxToken } from '../../../auth/getTokenxToken';
import getConfig from 'next/config';
import { logger } from '@navikt/next-logger';

const basePath = environment.flexJarApi;

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

  proxy.on('proxyRes', function (proxyRes: any, _req: any, _res: any) {
    console.log('RAW Response from the target', JSON.stringify(proxyRes.headers));
  });

  proxy.on('proxyReq', async function (proxyReq: any, req: any, _res: any, _options: any) {
    console.log('RAW Request from the client', JSON.stringify(proxyReq.body));
    proxyReq.setHeader('cookie', '');
    const bearerTokeToken = await bearerToken(req)!;
    proxyReq.setHeader('Authorize', `bearer ${bearerTokeToken}`);
    console.log('RAW Request from the client', JSON.stringify(proxyReq));
  });
};

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  console.log('Request');
  logger.info('Request');
  const env = process.env.NODE_ENV;
  if (env == 'development') {
    return res.status(200).json(org);
  } else if (env == 'production') {
    return httpProxyMiddleware(req, res, {
      target: basePath,
      onProxyInit: handleProxyInit,
      pathRewrite: [
        {
          patternStr: '^/api/flexjar-backend/',
          replaceStr: ''
        }
      ]
    });
  }
});

export default handler;

async function bearerToken(req: any): Promise<string | undefined> {
  const { serverRuntimeConfig } = getConfig();

  const backendClientId = serverRuntimeConfig.flexjarBackendClientId;
  if (backendClientId) {
    const idportenToken = req.headers.authorization!.split(' ')[1];
    return await getTokenxToken(idportenToken, backendClientId);
  }
  return undefined;
}

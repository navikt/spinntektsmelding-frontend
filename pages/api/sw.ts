// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';

import org from '../../mockdata/testOrganisasjoner';

const basePath = 'https://swapi.dev/api/people/1';

type Data = typeof org;

const handleProxyInit = (proxy) => {
  /**
   * Check the list of bindable events in the `http-proxy` specification.
   * @see https://www.npmjs.com/package/http-proxy#listening-for-proxy-events
   */
  proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });

    res.end('Something went wrong. And we are reporting a custom error message.');
  });

  // proxy.on('proxyRes', function (proxyRes, req, res) {
  //   console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
  // });
};

export const config = {
  api: {
    // Enable `externalResolver` option in Next.js
    externalResolver: true
  }
};

const handler = (
  req: NextApiRequest,
  res: NextApiResponse<Data> //res.status(200).json(org);
) =>
  httpProxyMiddleware(req, res, {
    // You can use the `http-proxy` option
    target: basePath,
    onProxyInit: handleProxyInit,
    // In addition, you can use the `pathRewrite` option provided by `next-http-proxy-middleware`
    pathRewrite: [
      {
        patternStr: '^/api/sw',
        replaceStr: ''
        // }, {
        //   patternStr: '^/api',
        //   replaceStr: ''
      }
    ]
  });

export default handler;

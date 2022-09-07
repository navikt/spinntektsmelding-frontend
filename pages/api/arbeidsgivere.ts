// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';

// import org from '../../mockdata/testOrganisasjoner';

// const basePath = 'https://arbeidsgiver.dev.nav.no/fritak-agp/api/v1/arbeidsgivere';
const basePath = 'https://fritakagp.dev.nav.no/api/v1/arbeidsgivere';

// type Data = typeof org;

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
        patternStr: '^/api/arbeidsgivere',
        replaceStr: ''
        // }, {
        //   patternStr: '^/api',
        //   replaceStr: ''
      }
    ]
  });

export default handler;

import { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';

const handler = (req: NextApiRequest, res: NextApiResponse) =>
  httpProxyMiddleware(req, res, {
    // You can use the `http-proxy` option
    // target: 'https://www.example.com',
    // In addition, you can use the `pathRewrite` option provided by `next-http-proxy`
    pathRewrite: [
      {
        patternStr: '^/im-dialog/api/google',
        replaceStr: 'http://google.com'
      },
      {
        patternStr: '^/im-dialog/api/myhome',
        replaceStr: 'http://github.com/stegano'
      }
    ]
  });

export default handler;

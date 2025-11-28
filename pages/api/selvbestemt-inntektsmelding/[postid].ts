// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';

// import org from '../../../mockdata/respons-selvbestemt.json';

import handleProxyInit from '../../../utils/api/handleProxyInit';
// import path from 'path';
import fs from 'fs';
import path from 'path';

const basePath = 'http://' + globalThis.process.env.IM_API_URI + process.env.INNSENDING_SELVBESTEMT_INNTEKTSMELDING_API;

// type Data = typeof org;

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse<any>) => {
  const env = process.env.NODE_ENV;
  if (env == 'development') {
    const mockdata = 'respons-selvbestemt';
    const filePath = path.join(process.cwd(), 'mockdata', `${mockdata}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Mock not found' });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return res.status(201).json(data);
  } else if (env == 'production') {
    return httpProxyMiddleware(req, res, {
      target: basePath,
      onProxyInit: handleProxyInit,
      pathRewrite: [
        {
          patternStr: '^/api/selvbestemt-inntektsmelding',
          replaceStr: ''
        }
      ]
    });
  }
};

export default handler;

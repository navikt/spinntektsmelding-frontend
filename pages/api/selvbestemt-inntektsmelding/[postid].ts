// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import handleProxyInit from '../../../utils/api/handleProxyInit';
import fs from 'node:fs';
import path from 'node:path';
import { requireEnv } from '../../../utils/api/validateEnv';

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse<unknown>) => {
  const env = process.env.NODE_ENV;
  if (env === 'development') {
    const mockdata = 'respons-selvbestemt';
    const filePath = path.join(process.cwd(), 'mockdata', `${mockdata}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Mock not found' });
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return res.status(201).json(data);
    } catch (error) {
      console.error('Failed to parse mock data:', error);
      return res.status(500).json({ error: 'Failed to parse mock data' });
    }
  } else if (env === 'production') {
    try {
      const basePath = 'http://' + requireEnv('IM_API_URI') + requireEnv('INNSENDING_SELVBESTEMT_INNTEKTSMELDING_API');
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
    } catch (error) {
      console.error('Missing required environment variables:', error);
      return res.status(500).json({ error: 'Server configuration error' });
    }
  } else {
    return res.status(500).json({ error: 'Invalid NODE_ENV' });
  }
};

export default handler;

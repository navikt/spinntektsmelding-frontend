// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import handleProxyInit from '../../utils/api/handleProxyInit';
import fs from 'node:fs';
import path from 'node:path';
import { logger } from '@navikt/next-logger';
import { requireEnv } from '../../utils/api/validateEnv';

type InntektsData = {
  gjennomsnitt: number;
  historikk: Record<string, number>;
};

type InntektsdataResponse = InntektsData | { error: string };

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse<InntektsdataResponse>) => {
  const env = process.env.NODE_ENV;
  if (env === 'development') {
    const mockdata = 'inntektData';
    const filePath = path.join(process.cwd(), 'mockdata', `${mockdata}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Mock not found' });
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      logger.info('inntektsdata mock data loaded');
      return res.status(200).json(data);
    } catch (error) {
      console.error('Failed to parse mock data:', error);
      return res.status(500).json({ error: 'Failed to parse mock data' });
    }
  } else if (env === 'production') {
    try {
      const basePath = 'http://' + requireEnv('IM_API_URI') + requireEnv('INNTEKTSDATA_API');
      return httpProxyMiddleware(req, res, {
        target: basePath,
        onProxyInit: handleProxyInit,
        pathRewrite: [
          {
            patternStr: '^/api/inntektsdata',
            replaceStr: ''
          }
        ]
      });
    } catch (error) {
      console.error('Missing required environment variables:', error);
      return res.status(500).json({ error: 'Server configuration error' });
    }
  }
};

export default handler;

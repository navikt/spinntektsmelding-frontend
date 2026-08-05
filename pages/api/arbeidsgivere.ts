// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import handleProxyInit from '../../utils/api/handleProxyInit';
import { MottattArbeidsgiver } from '../../schema/MottattArbeidsgiverSchema';
import fs from 'node:fs';
import path from 'node:path';
import { requireEnv } from '../../utils/api/validateEnv';

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};

type ErrorResponse = { error: string };
type MottattArbeidsgiverResponse = MottattArbeidsgiver[];
type Data = MottattArbeidsgiverResponse | ErrorResponse;

const handler = (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const env = process.env.NODE_ENV;
  if (env === 'development') {
    const mockdata = 'testOrganisasjoner';
    const filePath = path.join(process.cwd(), 'mockdata', `${mockdata}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Mock not found' });
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return res.status(200).json(data);
    } catch (error) {
      console.error('Failed to parse mock data:', error);
      return res.status(500).json({ error: 'Failed to parse mock data' });
    }
  } else if (env === 'production') {
    try {
      const basePath = 'http://' + requireEnv('IM_API_URI') + requireEnv('ARBEIDSGIVERLISTE_API');
      return httpProxyMiddleware(req, res, {
        target: basePath,
        onProxyInit: handleProxyInit,
        pathRewrite: [
          {
            patternStr: '^/api/arbeidsgivere',
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

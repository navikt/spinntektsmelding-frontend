// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import handleProxyInit from '../../utils/api/handleProxyInit';
import { MottattArbeidsgiver } from '../../schema/MottattArbeidsgiverSchema';
import fs from 'node:fs';
import path from 'node:path';

const basePath = 'http://' + globalThis.process.env.IM_API_URI + process.env.ARBEIDSGIVERLISTE_API;

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
  if (env == 'development') {
    const mockdata = 'testOrganisasjoner';
    const filePath = path.join(process.cwd(), 'mockdata', `${mockdata}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Mock not found' });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return res.status(200).json(data);
  } else if (env == 'production') {
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
  }
};

export default handler;

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import handleProxyInit from '../../utils/api/handleProxyInit';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { logger } from '@navikt/next-logger';
import { requireEnv } from '../../utils/api/validateEnv';
import isMod11Number from '../../utils/isMod11Number';
import isFnrNumber from '../../utils/isFnrNumber';

type InntektsData = {
  gjennomsnitt: number;
  historikk: Record<string, number>;
};

type InntektsdataResponse = InntektsData | { error: string };

const requestBodySchema = z.object({
  orgnummer: z.string().min(1),
  fnr: z.string().min(1)
});

export const config = {
  api: {
    externalResolver: true,
    bodyParser: true
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
    const parsedBody = requestBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      logger.info('sp-soeknader: Ugyldig request body for sykepengesøknader');
      return res.status(400).json({ error: 'Ugyldig forespørsel' });
    }

    const { orgnummer, fnr } = parsedBody.data;
    if (!isMod11Number(orgnummer)) {
      logger.info('sp-soeknader: Ugyldig orgnr: ' + orgnummer);
      return res.status(400).json({ error: 'Ugyldig organisasjonsnummer' });
    }
    if (!isFnrNumber(fnr)) {
      logger.info('sp-soeknader: Ugyldig fnr');
      return res.status(400).json({ error: 'Ugyldig fødselsnummer' });
    }

    const bodyToSend = {
      orgnr: parsedBody.data.orgnummer,
      sykmeldtFnr: parsedBody.data.fnr,
      erBehandlingsdager: false
    };

    try {
      const basePath = 'http://' + requireEnv('IM_API_URI') + requireEnv('HENT-SOEKNADER');
      return httpProxyMiddleware(req, res, {
        target: basePath,
        onProxyInit: (proxy) => onProxyInitWithBody(proxy, bodyToSend),
        pathRewrite: [
          {
            patternStr: '^/api/sp-soeknader',
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

function onProxyInitWithBody(proxy: Parameters<typeof handleProxyInit>[0], body: unknown) {
  handleProxyInit(proxy);
  proxy.on('proxyReq', (proxyReq: any) => {
    const bodyData = JSON.stringify(body);
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  });
}

export default handler;

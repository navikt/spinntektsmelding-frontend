// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken, requestOboToken, validateToken } from '@navikt/oasis';
import fs from 'node:fs';
import isMod11Number from '../../utils/isMod11Number';
import { EndepunktSykepengesoeknaderSchema } from '../../schema/EndepunktSykepengesoeknaderSchema';
import { z } from 'zod';
import safelyParseJSON from '../../utils/safelyParseJson';
import path from 'node:path';
import { logger } from '@navikt/next-logger';
import isFnrNumber from '../../utils/isFnrNumber';
import { requireEnv } from '../../utils/api/validateEnv';

const requestBodySchema = z.object({
  orgnummer: z.string().min(1),
  fnr: z.string().min(1),
  eldsteFom: z.string().min(1)
});

function handleMethodNotAllowed(req: NextApiRequest, res: NextApiResponse<unknown>): NextApiResponse<unknown> | void {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}

function handleDevelopmentRequest(res: NextApiResponse<unknown>): NextApiResponse<unknown> | void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const mockdata = 'ansettelsesforhold-to-perioder';
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
}

function parseRequestBody(req: NextApiRequest, res: NextApiResponse<unknown>) {
  const parsedBody = requestBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    logger.info('Ugyldig request body for arbeidsforhold');
    res.status(400).json({ error: 'Ugyldig forespørsel' });
    return null;
  }

  return parsedBody.data;
}

type forespoerselIdListeEnhet = {
  vedtaksperiodeId: string;
  forespoerselId: string;
};

export const config = {
  api: {
    externalResolver: true
  }
};

type Sykepengesoeknader = z.infer<typeof EndepunktSykepengesoeknaderSchema>;

const handler = async (req: NextApiRequest, res: NextApiResponse<unknown>) => {
  try {
    const methodNotAllowed = handleMethodNotAllowed(req, res);
    if (methodNotAllowed) {
      return methodNotAllowed;
    }

    const developmentResponse = handleDevelopmentRequest(res);
    if (developmentResponse) {
      return developmentResponse;
    }

    const basePath = 'http://' + requireEnv('FLEX_SYKEPENGESOEKNAD_INGRESS') + requireEnv('FLEX_SYKEPENGESOEKNAD_URL');
    const authApi = 'http://' + requireEnv('IM_API_URI') + requireEnv('AUTH_SYKEPENGESOEKNAD_API');
    const forespoerselIdListeApi = 'http://' + requireEnv('IM_API_URI') + requireEnv('FORESPOERSEL_ID_LISTE_API');
    const clientId = requireEnv('FLEX_SYKEPENGESOEKNAD_CLIENT_ID');

    const token = getToken(req);
    if (!token) {
      logger.info('Mangler token i header');
      return res.status(401);
    }

    const validation = await validateToken(token);
    if (!validation.ok) {
      logger.info('Validering feilet: ' + JSON.stringify(validation.error));
      return res.status(401);
    }

    const requestBody = parseRequestBody(req, res);
    if (!requestBody) {
      return;
    }
    const orgnr = requestBody.orgnummer;

    if (!isMod11Number(orgnr)) {
      logger.info('Ugyldig orgnr: ' + orgnr);
      return res.status(400).json({ error: 'Ugyldig organisasjonsnummer' });
    }

    const tokenResponse = await fetch(authApi + '/' + orgnr, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!tokenResponse.ok) {
      logger.info('Feil ved kontroll av tilgang: ' + tokenResponse.statusText);
      return res.status(tokenResponse.status).json({ error: 'Feil ved kontroll av tilgang' });
    }

    const obo = await requestOboToken(token, clientId);
    if (!obo.ok) {
      logger.info('OBO-feil: ' + JSON.stringify(obo.error));
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fnr = requestBody.fnr;
    const eldsteFom = requestBody.eldsteFom;

    if (!isFnrNumber(fnr)) {
      logger.info('Ugyldig fnr: ' + fnr);
      return res.status(400).json({ error: 'Ugyldig fødselsnummer' });
    }

    if (Number.isNaN(Date.parse(eldsteFom))) {
      logger.info('Ugyldig dato: ' + eldsteFom);
      return res.status(400).json({ error: 'Ugyldig dato' });
    }

    const soeknadResponse = await fetch(basePath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${obo.token}`
      },
      body: JSON.stringify({
        orgnummer: requestBody.orgnummer,
        fnr: requestBody.fnr,
        eldsteFom: requestBody.eldsteFom
      })
    });

    if (!soeknadResponse.ok) {
      logger.error('Feil ved henting av sykepengesøknader ' + soeknadResponse.statusText);
      return res.status(soeknadResponse.status).json({ error: 'Feil ved kontroll av tilgang til sykepengesøknader' });
    }

    const soeknadData: Sykepengesoeknader = (await safelyParseJSON(soeknadResponse)) as Sykepengesoeknader;
    const aktiveSoeknader = soeknadData.filter((soeknad) => soeknad.vedtaksperiodeId);

    if (aktiveSoeknader.length === 0) {
      return res.status(200).json([]);
    }

    const idListe = aktiveSoeknader.map((soeknad) => soeknad.vedtaksperiodeId);
    const forespoerselIdListe = await fetch(forespoerselIdListeApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ vedtaksperiodeIdListe: idListe })
    });

    if (!forespoerselIdListe.ok) {
      logger.error('Feil ved henting av forespørselIder ' + forespoerselIdListe.statusText);
      return res.status(forespoerselIdListe.status).json({ error: 'Feil ved henting av forespørselIder' });
    }

    const forespoerselIdListeData: forespoerselIdListeEnhet[] = (await safelyParseJSON(
      forespoerselIdListe
    )) as forespoerselIdListeEnhet[];

    const soeknadResponseData = aktiveSoeknader.map((soeknad) => ({
      ...soeknad,
      forespoerselId: forespoerselIdListeData.find(
        (forespoersel) => soeknad.vedtaksperiodeId === forespoersel.vedtaksperiodeId
      )?.forespoerselId
    }));

    return res.status(soeknadResponse.status).json(soeknadResponseData);
  } catch (error) {
    console.error('Missing required environment variables or error:', error);
    return res.status(500).json({ error: 'Server configuration error' });
  }
};

export default handler;

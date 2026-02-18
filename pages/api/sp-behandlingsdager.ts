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

function minDate(date1: string, date2: string): string {
  return date1 < date2 ? date1 : date2;
}
function maxDate(date1: string, date2: string): string {
  return date1 > date2 ? date1 : date2;
}

const basePath =
  'http://' + globalThis.process.env.FLEX_SYKEPENGESOEKNAD_INGRESS + globalThis.process.env.FLEX_SYKEPENGESOEKNAD_URL;
const authApi = 'http://' + globalThis.process.env.IM_API_URI + globalThis.process.env.AUTH_SYKEPENGESOEKNAD_API;

export const config = {
  api: {
    externalResolver: true
  }
};

type Sykepengesoeknader = z.infer<typeof EndepunktSykepengesoeknaderSchema>;

const handler = async (req: NextApiRequest, res: NextApiResponse<unknown>) => {
  const env = process.env.NODE_ENV;
  if (env === 'development') {
    const mockdata = 'behandlingsdager';
    const filePath = path.join(process.cwd(), 'mockdata', `${mockdata}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Mock not found' });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    setTimeout(() => res.status(200).json(data), 100);
    return;
  }

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

  const requestBody = await req.body;
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
    logger.info('Feil ved kontroll av tilgang: ' + tokenResponse.statusText + ', url: ' + tokenResponse.url);
    return res.status(tokenResponse.status).json({ error: 'Feil ved kontroll av tilgang' });
  }

  const obo = await requestOboToken(token, process.env.FLEX_SYKEPENGESOEKNAD_CLIENT_ID!);
  if (!obo.ok) {
    logger.info('OBO-feil: ' + JSON.stringify(obo.error));
    return res.status(401).json({ error: 'Unauthorized' });
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
  const aktiveSoeknader = [...(soeknadData ?? [])].filter((soeknad) => soeknad.soknadstype === 'BEHANDLINGSDAGER');

  if (aktiveSoeknader.length === 0) {
    logger.info(
      `Ingen aktive behandlingsdager funnet for orgnr: ${orgnr}, selv om antall poster var: ${soeknadData?.length ?? 0}`
    );
    return res.status(200).json([]);
  }

  let sykmeldingPerioder = [aktiveSoeknader[0]];

  aktiveSoeknader.forEach((soeknad) => {
    if (!sykmeldingPerioder.some((periode) => periode.sykmeldingId === soeknad.sykmeldingId)) {
      sykmeldingPerioder.push(soeknad);
    }
    sykmeldingPerioder = sykmeldingPerioder.map((periode) => {
      if (periode.sykmeldingId === soeknad.sykmeldingId) {
        return {
          ...periode,
          behandlingsdager: [...new Set([...(periode.behandlingsdager ?? []), ...(soeknad.behandlingsdager ?? [])])],
          fom: minDate(periode.fom, soeknad.fom),
          tom: maxDate(periode.tom, soeknad.tom)
        };
      }
      return periode;
    });
  });

  logger.info(
    `Hentet aktive behandlingsdager for orgnr: ${orgnr}, antall: ${sykmeldingPerioder.length}, fra: ${aktiveSoeknader.length}`
  );

  return res.status(soeknadResponse.status).json(sykmeldingPerioder);
};

export default handler;

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken, requestOboToken, validateToken } from '@navikt/oasis';
import fs from 'node:fs';
import { EndepunktAltinnTilganger } from '../../schema/EndepunktAltinnTilgangerSchema';
import safelyParseJSON from '../../utils/safelyParseJson';
import path from 'node:path';
import { logger } from '@navikt/next-logger';

const basePath = 'http://' + globalThis.process.env.FAGER_TILGANG_INGRESS + globalThis.process.env.FAGER_TILGANG_URL;

export const config = {
  api: {
    externalResolver: true
  }
};

type OrgNode = {
  orgnr: string;
  navn: string;
  underenheter: OrgNode[];
};

function extractOrgStructure(hierarki: any[]): OrgNode[] {
  return hierarki.map(({ orgnr, navn, underenheter }) => ({
    orgnr,
    navn,
    underenheter: extractOrgStructure(underenheter ?? [])
  }));
}

const handler = async (req: NextApiRequest, res: NextApiResponse<unknown>) => {
  const env = process.env.NODE_ENV;
  if (env === 'development') {
    const mockdata = 'endepunktAltinnTilganger';
    const filePath = path.join(process.cwd(), 'mockdata', `${mockdata}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Mock not found' });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const simpleTree = extractOrgStructure(data.hierarki);
    setTimeout(() => res.status(200).json(simpleTree), 100);
    return;
  }

  const token = getToken(req);
  if (!token) {
    logger.info('Mangler token i header');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const validation = await validateToken(token);
  if (!validation.ok) {
    logger.info('Validering feilet: ' + JSON.stringify(validation.error));
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const obo = await requestOboToken(token, process.env.FAGER_TILGANG_CLIENT_ID!);
  if (!obo.ok) {
    logger.info('OBO-feil: ' + JSON.stringify(obo.error));
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const accessResponse = await fetch(basePath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${obo.token}`
    },
    body: JSON.stringify({
      filter: {
        altinn2Tilganger: ['4936:1'],
        altinn3Tilganger: []
      }
    })
  });

  if (!accessResponse.ok) {
    logger.info('Feil ved henting av tilganger ' + accessResponse.statusText);
    return res.status(accessResponse.status).json({ error: 'Feil ved kontroll av tilgang til sykepengesøknader' });
  }

  const accessData: EndepunktAltinnTilganger = (await safelyParseJSON(accessResponse)) as EndepunktAltinnTilganger;

  return res.status(accessResponse.status).json(accessData.hierarki || []);
};

export default handler;

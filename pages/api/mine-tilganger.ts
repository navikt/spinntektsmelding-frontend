// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken, requestOboToken, validateToken } from '@navikt/oasis';

import testdata from '../../mockdata/endepunktAltinnTilganger.json';
import { EndepunktAltinnTilganger } from '../../schema/EndepunktAltinnTilgangerSchema';
import { z } from 'zod';
import safelyParseJSON from '../../utils/safelyParseJson';

const basePath = 'http://' + global.process.env.FAGER_TILGANG_INGRESS + global.process.env.FAGER_TILGANG_URL;

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
    const simpleTree = extractOrgStructure(testdata.hierarki);
    setTimeout(() => res.status(200).json(simpleTree), 100);
    return;
  }

  const token = getToken(req);
  if (!token) {
    console.error('Mangler token i header');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.error('Fant token i header');

  const validation = await validateToken(token);
  if (!validation.ok) {
    console.log('Validering feilet: ', validation.error);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const obo = await requestOboToken(token, process.env.FAGER_TILGANG_CLIENT_ID!);
  if (!obo.ok) {
    console.error('OBO-feil: ', obo.error);
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
    console.error('Feil ved henting av tilganger ', accessResponse.statusText);
    return res.status(accessResponse.status).json({ error: 'Feil ved kontroll av tilgang til sykepengesøknader' });
  }

  const accessData: EndepunktAltinnTilganger = (await safelyParseJSON(accessResponse)) as EndepunktAltinnTilganger;

  return res.status(accessResponse.status).json(accessData.hierarki || []);
};

export default handler;

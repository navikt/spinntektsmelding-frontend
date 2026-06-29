// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken, requestOboToken, validateToken } from '@navikt/oasis';
import fs from 'node:fs';
import { EndepunktAltinnTilganger } from '../../schema/EndepunktAltinnTilgangerSchema';
import safelyParseJSON from '../../utils/safelyParseJson';
import path from 'node:path';
import { logger } from '@navikt/next-logger';
import { teamLogger } from '@navikt/next-logger/team-log';
import { requireEnv } from '../../utils/api/validateEnv';

export const config = {
  api: {
    externalResolver: true
  }
};

let teamLoggerGuardRegistrert = false;
function registrerTeamLoggerGuard() {
  if (teamLoggerGuardRegistrert) {
    return;
  }
  teamLoggerGuardRegistrert = true;
  process.on('uncaughtException', (err) => {
    if (err instanceof Error && err.message.includes('the worker has exited')) {
      logger.warn('teamLogger-worker avsluttet, ignorerer for å unngå nedetid');
      return;
    }
    throw err;
  });
}

registrerTeamLoggerGuard();

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

function tellOrganisasjoner(hierarki: any[]): number {
  return (hierarki ?? []).reduce((sum, node) => sum + 1 + tellOrganisasjoner(node.underenheter ?? []), 0);
}

function samleAltinn3Tilganger(hierarki: any[]): { orgnr: string; altinn3Tilganger: string[] }[] {
  return (hierarki ?? []).flatMap((node) => [
    { orgnr: node.orgnr, altinn3Tilganger: node.altinn3Tilganger ?? [] },
    ...samleAltinn3Tilganger(node.underenheter ?? [])
  ]);
}

const handler = async (req: NextApiRequest, res: NextApiResponse<unknown>) => {
  const env = process.env.NODE_ENV;
  if (env === 'development') {
    const mockdata = 'endepunktAltinnTilganger';
    const filePath = path.join(process.cwd(), 'mockdata', `${mockdata}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Mock not found' });
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const simpleTree = extractOrgStructure(data.hierarki);
      setTimeout(() => res.status(200).json(simpleTree), 100);
      return;
    } catch (error) {
      console.error('Failed to parse mock data:', error);
      return res.status(500).json({ error: 'Failed to parse mock data' });
    }
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

  const basePath = 'http://' + requireEnv('FAGER_TILGANG_INGRESS') + requireEnv('FAGER_TILGANG_URL');
  const clientId = requireEnv('FAGER_TILGANG_CLIENT_ID');

  const obo = await requestOboToken(token, clientId);
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
        altinn3Tilganger: ['nav_sykepenger_inntektsmelding']
      }
    })
  });

  if (!accessResponse.ok) {
    logger.info('Feil ved henting av tilganger ' + accessResponse.statusText);
    return res.status(accessResponse.status).json({ error: 'Feil ved kontroll av tilgang til sykepengesøknader' });
  }

  const accessData: EndepunktAltinnTilganger = (await safelyParseJSON(accessResponse)) as EndepunktAltinnTilganger;

  const antallOrganisasjoner = tellOrganisasjoner(accessData.hierarki);
  const altinn3Tilganger = samleAltinn3Tilganger(accessData.hierarki);
  const antallTilganger = altinn3Tilganger.filter((t) => t.altinn3Tilganger.length > 0).length;
  logger.info({ antallOrganisasjoner, antallTilganger }, 'Mine-tilganger hentet');
  try {
    teamLogger.info(
      {
        antallOrganisasjoner,
        altinn3Tilganger
      },
      'Forespørsel om mine-tilganger'
    );
  } catch (e) {
    logger.warn({ err: e }, 'teamLogger feilet: ' + (e instanceof Error ? e.message : String(e)));
  }

  return res.status(accessResponse.status).json(accessData.hierarki || []);
};

export default handler;

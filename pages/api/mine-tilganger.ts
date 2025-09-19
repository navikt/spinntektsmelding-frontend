// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import testdata from '../../mockdata/endepunktAltinnTilganger.json';
import { EndepunktAltinnTilganger } from '../../schema/EndepunktAltinnTilgangerSchema';
import safelyParseJSON from '../../utils/safelyParseJson';
import { createHandler } from '../../server/http/handlerFactory';

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

export default createHandler<never, any>({
  devMock: () => extractOrgStructure(testdata.hierarki),
  requireAuth: true,
  oboClientId: process.env.FAGER_TILGANG_CLIENT_ID!,
  action: async ({ oboToken }) => {
    const accessResponse = await fetch(basePath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${oboToken}` },
      body: JSON.stringify({
        filter: { altinn2Tilganger: ['4936:1'], altinn3Tilganger: [] }
      })
    });
    if (!accessResponse.ok) throw new Error('Feil ved henting av tilganger');
    const accessData: EndepunktAltinnTilganger = (await safelyParseJSON(accessResponse)) as EndepunktAltinnTilganger;
    return accessData.hierarki ? extractOrgStructure(accessData.hierarki) : [];
  }
});

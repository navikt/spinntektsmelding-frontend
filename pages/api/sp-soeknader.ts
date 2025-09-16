import testdata from '../../mockdata/sp-soeknad.json';
import isMod11Number from '../../utils/isMod10Number';
import { createHandler } from '../../server/http/handlerFactory';
import { ApiError } from '../../server/auth/token';
import { fetchSoeknader, mapAktiveSoeknader } from '../../server/domain/soeknaderService';
import safelyParseJSON from '../../utils/safelyParseJson';

type ForespoerselIdEnhet = { vedtaksperiodeId: string; forespoerselId: string };

const basePath =
  'http://' + global.process.env.FLEX_SYKEPENGESOEKNAD_INGRESS + global.process.env.FLEX_SYKEPENGESOEKNAD_URL;
const authApi = 'http://' + global.process.env.IM_API_URI + global.process.env.AUTH_SYKEPENGESOEKNAD_API;
const forespoerselIdListeApi = 'http://' + global.process.env.IM_API_URI + global.process.env.FORESPOERSEL_ID_LISTE_API;

export const config = { api: { externalResolver: true } };

interface BodyShape {
  orgnummer: string;
  fnr: string;
  eldsteFom?: string;
}

function validateBody(body: unknown): asserts body is BodyShape {
  if (!body || typeof body !== 'object') throw new ApiError(400, 'BAD_REQUEST', 'Ugyldig body');
  const b = body as any;
  if (typeof b.orgnummer !== 'string' || typeof b.fnr !== 'string') {
    throw new ApiError(400, 'BAD_REQUEST', 'Ugyldig body');
  }
}

export default createHandler<BodyShape, any>({
  devMock: () => testdata,
  requireAuth: true,
  oboClientId: process.env.FLEX_SYKEPENGESOEKNAD_CLIENT_ID!,
  validateBody,
  action: async ({ body, token, oboToken }) => {
    if (!isMod11Number(body.orgnummer)) {
      throw new ApiError(400, 'UGYLDIG_ORGNR', 'Ugyldig organisasjonsnummer');
    }
    // tilgangskontroll
    const tilgang = await fetch(authApi + '/' + body.orgnummer, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });
    if (!tilgang.ok) {
      throw new ApiError(403, 'TILGANGSFEIL', 'Feil ved kontroll av tilgang');
    }

    const soeknader = await fetchSoeknader({ basePath, token: oboToken!, requestBody: body });
    const aktive = mapAktiveSoeknader(soeknader);
    if (aktive.length === 0) return [];

    const idListe = aktive.map((s) => s.vedtaksperiodeId);
    const forespoerselResp = await fetch(forespoerselIdListeApi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ vedtaksperiodeIdListe: idListe })
    });
    if (!forespoerselResp.ok) throw new ApiError(403, 'FORESPOERSEL_IDER_FEIL', 'Feil ved henting av forespørselIder');
    const forespoerselData: ForespoerselIdEnhet[] = (await safelyParseJSON(forespoerselResp)) as ForespoerselIdEnhet[];

    return aktive.map((s) => ({
      ...s,
      forespoerselId: forespoerselData.find((f) => f.vedtaksperiodeId === s.vedtaksperiodeId)?.forespoerselId
    }));
  }
});

import testdata from '../../mockdata/sp-soeknad.json';
import isMod11Number from '../../utils/isMod10Number';
import { createHandler } from '../../server/http/handlerFactory';
import { ApiError } from '../../server/auth/token';
import { mapAktiveSoeknader } from '../../server/domain/soeknaderService';
import safelyParseJSON from '../../utils/safelyParseJson';
import {
  SoeknadBody,
  validateSoeknadBody,
  getBasePath,
  sjekkTilgang,
  hentSoeknader
} from '../../server/domain/spCommon';

type ForespoerselIdEnhet = { vedtaksperiodeId: string; forespoerselId: string };

const forespoerselIdListeApi = 'http://' + global.process.env.IM_API_URI + global.process.env.FORESPOERSEL_ID_LISTE_API;

export const config = { api: { externalResolver: true } };

type BodyShape = SoeknadBody;
const validateBody = validateSoeknadBody;

export default createHandler<BodyShape, any>({
  devMock: () => testdata,
  requireAuth: true,
  oboClientId: process.env.FLEX_SYKEPENGESOEKNAD_CLIENT_ID!,
  validateBody,
  action: async ({ body, token, oboToken }) => {
    if (!isMod11Number(body.orgnummer)) {
      throw new ApiError(400, 'UGYLDIG_ORGNR', 'Ugyldig organisasjonsnummer');
    }
    await sjekkTilgang(body.orgnummer, token!);

    const soeknader = await hentSoeknader({ body, oboToken: oboToken! });
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

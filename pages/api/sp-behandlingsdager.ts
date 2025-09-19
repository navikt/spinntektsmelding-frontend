// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import testdata from '../../mockdata/behandlingsdager.json';
import isMod11Number from '../../utils/isMod10Number';
import { createHandler } from '../../server/http/handlerFactory';
import { ApiError } from '../../server/auth/token';
import { mapBehandlingsdager } from '../../server/domain/soeknaderService';
import { SoeknadBody, validateSoeknadBody, sjekkTilgang, hentSoeknader } from '../../server/domain/spCommon';

// basePath & authApi are now derived within shared helpers

export const config = {
  api: {
    externalResolver: true
  }
};

type BodyShape = SoeknadBody;
const validateBody = validateSoeknadBody;

export default createHandler<BodyShape, any>({
  devMock: () => testdata,
  requireAuth: true,
  oboClientId: process.env.FLEX_SYKEPENGESOEKNAD_CLIENT_ID || 'cid',
  validateBody,
  action: async ({ body, token, oboToken }) => {
    if (!isMod11Number(body.orgnummer)) {
      throw new ApiError(400, 'UGYLDIG_ORGNR', 'Ugyldig organisasjonsnummer');
    }
    await sjekkTilgang(body.orgnummer, token!);
    const data = await hentSoeknader({ body, oboToken: oboToken! });
    const mapped = mapBehandlingsdager(data);
    if (mapped.length === 0) return [];
    return mapped;
  }
});

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import testdata from '../../mockdata/behandlingsdager.json';
import isMod11Number from '../../utils/isMod10Number';
import { createHandler } from '../../server/http/handlerFactory';
import { ApiError } from '../../server/auth/token';
import { fetchSoeknader, mapBehandlingsdager } from '../../server/domain/soeknaderService';

const basePath =
  'http://' + global.process.env.FLEX_SYKEPENGESOEKNAD_INGRESS + global.process.env.FLEX_SYKEPENGESOEKNAD_URL;
const authApi = 'http://' + global.process.env.IM_API_URI + global.process.env.AUTH_SYKEPENGESOEKNAD_API;

export const config = {
  api: {
    externalResolver: true
  }
};

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
  oboClientId: process.env.FLEX_SYKEPENGESOEKNAD_CLIENT_ID || 'cid',
  validateBody,
  action: async ({ body, token, oboToken }) => {
    if (!isMod11Number(body.orgnummer)) {
      throw new ApiError(400, 'UGYLDIG_ORGNR', 'Ugyldig organisasjonsnummer');
    }

    const tilgang = await fetch(authApi + '/' + body.orgnummer, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });
    if (!tilgang.ok) {
      throw new ApiError(403, 'TILGANGSFEIL', 'Feil ved kontroll av tilgang');
    }

    const data = await fetchSoeknader({ basePath, token: oboToken!, requestBody: body });
    const mapped = mapBehandlingsdager(data);
    if (mapped.length === 0) return [];
    return mapped;
  }
});

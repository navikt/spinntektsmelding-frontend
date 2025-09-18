import { ApiError } from '../auth/token';
import { fetchSoeknader } from './soeknaderService';

export interface SoeknadBody {
  orgnummer: string;
  fnr: string;
  eldsteFom?: string;
}

export function validateSoeknadBody(body: unknown): asserts body is SoeknadBody {
  if (!body || typeof body !== 'object') throw new ApiError(400, 'BAD_REQUEST', 'Ugyldig body');
  const b = body as any;
  if (typeof b.orgnummer !== 'string' || typeof b.fnr !== 'string') {
    throw new ApiError(400, 'BAD_REQUEST', 'Ugyldig body');
  }
}

export function getBasePath(): string {
  return 'http://' + global.process.env.FLEX_SYKEPENGESOEKNAD_INGRESS + global.process.env.FLEX_SYKEPENGESOEKNAD_URL;
}

function getAuthApi(): string {
  return 'http://' + global.process.env.IM_API_URI + global.process.env.AUTH_SYKEPENGESOEKNAD_API;
}

export async function sjekkTilgang(orgnummer: string, token: string) {
  const authApi = getAuthApi();
  const resp = await fetch(authApi + '/' + orgnummer, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  });
  if (!resp.ok) {
    throw new ApiError(403, 'TILGANGSFEIL', 'Feil ved kontroll av tilgang');
  }
}

interface FetchArgs {
  body: SoeknadBody;
  oboToken: string;
}

export async function hentSoeknader({ body, oboToken }: FetchArgs) {
  const basePath = getBasePath();
  return fetchSoeknader({ basePath, token: oboToken, requestBody: body });
}

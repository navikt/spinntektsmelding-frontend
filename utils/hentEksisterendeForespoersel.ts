import { getToken, validateToken } from '@navikt/oasis';
import fetchEksisterendeForespoersel from './fetchEksisterendeForespoersel';
import NetworkError from './NetworkError';

export default async function hentEksisterendeForespoersel(pathSlug?: string | Array<string>, context?: any) {
  if (Array.isArray(pathSlug)) {
    return Promise.resolve({});
  }

  const token = getToken(context.req);
  if (!token) {
    /* håndter manglende token */
    console.error('Mangler token i header');
  }

  const validation = await validateToken(token);
  if (!validation.ok) {
    /* håndter valideringsfeil */
    console.error('Validering av token feilet');

    const error = new NetworkError('Ingen tilgang');
    error.status = 401;
    throw error;
  }

  if (pathSlug) {
    console.log(
      'Henter eksisterende forespørsel fra http://' + process.env.IM_API_URI + process.env.PREUTFYLT_INNTEKTSMELDING_API
    );
    return fetchEksisterendeForespoersel(
      'http://' + process.env.IM_API_URI + process.env.PREUTFYLT_INNTEKTSMELDING_API,
      pathSlug,
      token
    );
  }

  console.error('Forespørsel ID mangler');

  const error = new NetworkError('Forespørsel ID mangler');
  error.status = 400;
  throw error;
}

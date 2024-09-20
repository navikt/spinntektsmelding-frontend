import { getToken, validateToken } from '@navikt/oasis';
import fetchEksisterendeForespoersel from './fetchEksisterendeForespoersel';
import environment from '../config/environment';

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
    console.error('Valideringsfeil');
    const ingress = context.req.headers.host + environment.baseUrl;
    const currentPath = `https://${ingress}${context.resolvedUrl}`;

    const destination = `https://${ingress}/oauth2/login?redirect=${currentPath}`;
    return {
      redirect: {
        destination: destination,
        permanent: false
      }
    };
  }

  if (pathSlug) {
    return fetchEksisterendeForespoersel(
      'http://' + global.process.env.IM_API_URI + process.env.PREUTFYLT_INNTEKTSMELDING_API,
      pathSlug,
      token
    );
  }
}

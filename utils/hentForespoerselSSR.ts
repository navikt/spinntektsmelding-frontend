import { MottattData } from '../schema/MottattDataSchema';
import fetchDataSSR from './fetchDataSSR';

export default async function hentForespoerselSSR(
  pathSlug?: string | Array<string>,
  token?: string
): Promise<MottattData> {
  if (Array.isArray(pathSlug)) {
    throw new TypeError('Ugyldig pathSlug: må være en streng, ikke en array');
  }

  if (pathSlug) {
    return fetchDataSSR(
      `http://${globalThis.process.env.IM_API_URI}${process.env.PREUTFYLT_INNTEKTSMELDING_API}`,
      pathSlug,
      token
    );
  }
  throw new TypeError('Ugyldig pathSlug: må være en streng, ikke en array');
}

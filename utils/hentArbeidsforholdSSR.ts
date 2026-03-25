import { logger } from '@navikt/next-logger';
import { Ansettelsesforhold } from '../schema/AnsettelsesforholdSchema';
import fetchDataSSR from './fetchDataSSR';

export default function hentArbeidsforholdSSR(
  pathSlug?: string | Array<string>,
  token?: string
): Promise<Ansettelsesforhold> {
  if (Array.isArray(pathSlug)) {
    throw new Error('Ugyldig pathSlug: må være en streng, ikke en array');
  }

  if (pathSlug) {
    logger.info(
      `Henter arbeidsforhold for: http://${globalThis.process.env.IM_API_URI}${globalThis.process.env.ARBEIDSFORHOLD_API}`
    );
    return fetchDataSSR(
      `http://${globalThis.process.env.IM_API_URI}${globalThis.process.env.ARBEIDSFORHOLD_API}`,
      pathSlug,
      token
    );
  }
  throw new Error('Ugyldig pathSlug: må være en streng, ikke en array');
}

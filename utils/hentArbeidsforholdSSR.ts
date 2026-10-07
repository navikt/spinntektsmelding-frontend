import { logger } from '@navikt/next-logger';
import { Ansettelsesforhold } from '../schema/AnsettelsesforholdSchema';
import fetchDataSSR from './fetchDataSSR';
import isValidUUID from './isValidUUID';

export default async function hentArbeidsforholdSSR(
  uuid?: string | Array<string>,
  token?: string
): Promise<Ansettelsesforhold> {
  if (Array.isArray(uuid)) {
    throw new TypeError('Ugyldig uuid: må være en streng, ikke en array');
  }

  if (uuid && isValidUUID(uuid)) {
    logger.info(
      `Henter arbeidsforhold for: http://${globalThis.process.env.IM_API_URI}${globalThis.process.env.ARBEIDSFORHOLD_API}`
    );
    return fetchDataSSR(
      `http://${globalThis.process.env.IM_API_URI}${globalThis.process.env.ARBEIDSFORHOLD_API}`,
      uuid,
      token
    );
  }
  throw new TypeError('Ugyldig uuid: må være en gyldig UUID');
}

import { MottattData } from '../schema/MottattDataSchema';
import fetchDataSSR from './fetchDataSSR';
import isValidUUID from './isValidUUID';

export default async function hentForespoerselSSR(uuid?: string | Array<string>, token?: string): Promise<MottattData> {
  if (Array.isArray(uuid)) {
    throw new TypeError('Ugyldig uuid: må være en streng, ikke en array');
  }

  if (uuid && isValidUUID(uuid)) {
    return fetchDataSSR(
      `http://${globalThis.process.env.IM_API_URI}${process.env.PREUTFYLT_INNTEKTSMELDING_API}`,
      uuid,
      token
    );
  }
  throw new TypeError('Ugyldig uuid: må være en gyldig UUID');
}

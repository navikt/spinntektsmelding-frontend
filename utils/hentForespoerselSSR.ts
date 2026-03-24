import { MottattData } from '../schema/MottattDataSchema';
import fetchKvitteringsdataSSR from './fetchKvitteringsdataSSR';

export default function hentForespoerselSSR(
  pathSlug?: string | Array<string>,
  token?: string
): Promise<{ status: number; data: MottattData | null }> {
  if (Array.isArray(pathSlug)) {
    return Promise.resolve({ status: 400, data: null });
  }

  if (pathSlug) {
    return fetchKvitteringsdataSSR(
      `http://${globalThis.process.env.IM_API_URI}${process.env.PREUTFYLT_INNTEKTSMELDING_API}`,
      pathSlug,
      token
    );
  }
  return Promise.resolve({ status: 400, data: null });
}

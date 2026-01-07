import { MottattKvittering } from '../state/useKvitteringInit';
import fetchKvitteringsdataSSR from './fetchKvitteringsdataSSR';

export default function hentForespoerselSSR(
  pathSlug?: string | Array<string>,
  token?: string
): Promise<{ data: MottattKvittering | null }> {
  if (Array.isArray(pathSlug)) {
    return Promise.resolve({ data: null });
  }

  if (pathSlug) {
    return fetchKvitteringsdataSSR(
      `http://${globalThis.process.env.IM_API_URI}${process.env.PREUTFYLT_INNTEKTSMELDING_API}`,
      pathSlug,
      token
    );
  }
  return Promise.resolve({ data: null });
}

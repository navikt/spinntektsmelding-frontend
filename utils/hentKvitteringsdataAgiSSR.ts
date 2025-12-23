import { SelvbestemtKvittering } from '../schema/SelvbestemtKvitteringSchema';
import fetchKvitteringsdataSSR from './fetchKvitteringsdataSSR';

export default function hentKvitteringsdataAgiSSR(
  pathSlug?: string | Array<string>,
  token?: string
): Promise<{ data: SelvbestemtKvittering | null }> {
  if (Array.isArray(pathSlug)) {
    return Promise.resolve({ data: null });
  }

  if (pathSlug) {
    return fetchKvitteringsdataSSR(
      'http://' + globalThis.process.env.IM_API_URI + process.env.INNSENDING_SELVBESTEMT_INNTEKTSMELDING_API,
      pathSlug,
      token
    );
  }
  return Promise.resolve({ data: null });
}

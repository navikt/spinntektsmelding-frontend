import { MottattKvittering } from '../state/useKvitteringInit';
import { MottattKvitteringSchema } from '../schema/MottattKvitteringSchema';
import fetchKvitteringsdataSSR from './fetchKvitteringsdataSSR';

export default async function hentKvitteringsdataSSR(
  pathSlug?: string | Array<string>,
  token?: string
): Promise<{ data: MottattKvittering | null }> {
  if (Array.isArray(pathSlug)) {
    return { data: null };
  }

  if (pathSlug) {
    const response = await fetchKvitteringsdataSSR(
      'http://' + globalThis.process.env.IM_API_URI + process.env.KVITTERINGDATA_API,
      pathSlug,
      token
    );
    return { data: MottattKvitteringSchema.parse(response.data) };
  }
  return { data: null };
}

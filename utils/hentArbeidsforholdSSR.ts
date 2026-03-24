import { Ansettelsesforhold } from '../schema/AnsettelsesforholdSchema';
import fetchKvitteringsdataSSR from './fetchKvitteringsdataSSR';

export default function hentArbeidsforholdSSR(
  pathSlug?: string | Array<string>,
  token?: string
): Promise<{ data: Ansettelsesforhold | null }> {
  if (Array.isArray(pathSlug)) {
    return Promise.resolve({ data: null });
  }

  if (pathSlug) {
    return fetchKvitteringsdataSSR(
      `http://${globalThis.process.env.IM_API_URI}${process.env.ARBEIDSFORHOLD_API}`,
      pathSlug,
      token
    );
  }
  return Promise.resolve({ data: null });
}

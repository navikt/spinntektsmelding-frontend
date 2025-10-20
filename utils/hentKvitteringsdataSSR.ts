import fetchKvitteringsdataSSR from './fetchKvitteringsdataSSR';

export default function hentKvitteringsdataSSR(pathSlug?: string | Array<string>, token?: string) {
  if (Array.isArray(pathSlug)) {
    return Promise.resolve({});
  }

  if (pathSlug) {
    return fetchKvitteringsdataSSR(
      'http://' + global.process.env.IM_API_URI + process.env.NEXT_PUBLIC_INNSENDING_SELVBESTEMT_INNTEKTSMELDING_API,
      pathSlug,
      token
    );
  }
}

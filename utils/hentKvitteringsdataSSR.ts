import environment from '../config/environment';
import fetchKvitteringsdataSSR from './fetchKvitteringsdataSSR';

export default function hentKvitteringsdataSSR(pathSlug?: string | Array<string>, token?: string) {
  if (Array.isArray(pathSlug)) {
    return Promise.resolve({});
  }

  if (pathSlug) {
    return fetchKvitteringsdataSSR('http://localhost:3000/' + environment.innsendingAGInitiertUrl, pathSlug, token);
  }
}

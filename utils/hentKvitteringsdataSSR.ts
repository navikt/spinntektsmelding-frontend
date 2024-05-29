import environment from '../config/environment';
import fetchKvitteringsdata from './fetchKvitteringsdata';

export default function hentKvitteringsdataSSR(pathSlug?: string | Array<string>) {
  if (Array.isArray(pathSlug)) {
    return Promise.resolve({});
  }

  if (pathSlug) {
    return fetchKvitteringsdata('http://localhost:3000/' + environment.innsendingAGInitiertUrl + '/', pathSlug);
  }
}

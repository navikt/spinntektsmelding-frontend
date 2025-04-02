import environment from '../config/environment';
import fetchKvitteringsdata from './fetchKvitteringsdata';
import useKvitteringInit from '../state/useKvitteringInit';
import { logger } from '@navikt/next-logger';
import useBoundStore from '../state/useBoundStore';

export default function useHentKvitteringsdata() {
  const initState = useKvitteringInit();
  const setSkjemaFeilet = useBoundStore((state) => state.setSkjemaFeilet);

  return (pathSlug?: string | Array<string>) => {
    if (Array.isArray(pathSlug)) {
      return Promise.resolve({});
    }

    if (pathSlug) {
      return fetchKvitteringsdata(environment.hentKvitteringUrl, pathSlug)
        .then((skjemadata) => {
          if (skjemadata.status === 404) {
            setSkjemaFeilet();
            logger.warn('Fant ikke kvittering for ', pathSlug);
          }
          if (skjemadata.data !== undefined) {
            initState(skjemadata.data);
          }
        })
        .catch((error: any) => {
          if (error.status === 401) {
            const ingress = window.location.hostname + environment.baseUrl;
            const currentPath = window.location.href;

            window.location.replace(`https://${ingress}/oauth2/login?redirect=${currentPath}`);
          }

          if (error.status !== 200) {
            setSkjemaFeilet();
            logger.warn('Fant ikke kvittering for ', pathSlug);
          }
        });
    }
    return Promise.resolve();
  };
}

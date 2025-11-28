import environment from '../config/environment';
import fetchKvitteringsdata from './fetchKvitteringsdata';
import useKvitteringInit from '../state/useKvitteringInit';
import { logger } from '@navikt/next-logger';
import useBoundStore from '../state/useBoundStore';
import isValidUUID from './isValidUUID';

export default function useHentKvitteringsdata() {
  const initState = useKvitteringInit();
  const setSkjemaFeilet = useBoundStore((state) => state.setSkjemaFeilet);

  return (pathSlug?: string | Array<string>) => {
    if (Array.isArray(pathSlug)) {
      logger.warn(`Ugyldig pathSlug ${JSON.stringify(pathSlug)}. Forventet en enkelt verdi.`);
      return Promise.resolve({});
    }

    if (!isValidUUID(pathSlug || '')) {
      setSkjemaFeilet();
      logger.warn(`Ugyldig UUID for kvittering: ${pathSlug}`);
      return Promise.resolve();
    }

    return fetchKvitteringsdata(environment.hentKvitteringUrl, pathSlug!)
      .then((skjemadata) => {
        if (skjemadata.status === 404) {
          setSkjemaFeilet();
          logger.warn(`Fant ikke kvittering for ${pathSlug}. Feilkode:${skjemadata.status}.`);
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
          logger.warn(`Fant ikke kvittering for ${pathSlug}. Feilkode:${error.status}. Feiltekst: ${error.message}`);
        }
      });
  };
}

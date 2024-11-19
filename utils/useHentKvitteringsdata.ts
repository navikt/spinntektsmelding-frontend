import { useRouter } from 'next/navigation';
import environment from '../config/environment';
import fetchKvitteringsdata from './fetchKvitteringsdata';
import useHentSkjemadata from './useHentSkjemadata';
import useKvitteringInit from '../state/useKvitteringInit';
import { logger } from '@navikt/next-logger';

export default function useHentKvitteringsdata() {
  const initState = useKvitteringInit();
  const hentSkjemadata = useHentSkjemadata();
  const router = useRouter();

  return (pathSlug?: string | Array<string>) => {
    if (Array.isArray(pathSlug)) {
      return Promise.resolve({});
    }

    if (pathSlug) {
      return fetchKvitteringsdata(environment.hentKvitteringUrl, pathSlug)
        .then((skjemadata) => {
          if (skjemadata.status === 404) {
            return hentSkjemadata(pathSlug).catch((error: any) => {
              logger.warn('Feil ved henting av skjemadata i useHentKvitteringsdata', error);
              logger.warn(error);
            });
          }
          if (skjemadata.data !== undefined) {
            initState(skjemadata.data);
          }
          router.replace(`/kvittering/${pathSlug}`, undefined, { shallow: true });
        })
        .catch((error: any) => {
          if (error.status === 401) {
            const ingress = window.location.hostname + environment.baseUrl;
            const currentPath = window.location.href;

            window.location.replace(`https://${ingress}/oauth2/login?redirect=${currentPath}`);
          }

          if (error.status !== 200 && pathSlug) {
            return hentSkjemadata(pathSlug).catch((error: any) => {
              logger.warn('Feil ved henting av skjemadata i useHentKvitteringsdata', error);
              logger.warn(error);
            });
          }
        });
    }
  };
}

import environment from '../config/environment';
import useBoundStore from '../state/useBoundStore';
import fetchInntektskjemaForNotifikasjon from '../state/fetchInntektskjemaForNotifikasjon';
import useStateInit from '../state/useStateInit';
import feiltekster from './feiltekster';
import { useRouter } from 'next/navigation';
import { logger } from '@navikt/next-logger';
import isValidUUID from './isValidUUID';

export default function useHentSkjemadata() {
  const initState = useStateInit();
  const [leggTilFeilmelding, slettFeilmelding] = useBoundStore((state) => [
    state.leggTilFeilmelding,
    state.slettFeilmelding
  ]);
  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);
  const setSkjemaFeilet = useBoundStore((state) => state.setSkjemaFeilet);
  const router = useRouter();

  return (forespoerselID: string | Array<string>, erEndring: boolean) => {
    if (Array.isArray(forespoerselID)) {
      return Promise.resolve({});
    }

    if (forespoerselID && isValidUUID(forespoerselID)) {
      return fetchInntektskjemaForNotifikasjon(environment.skjemadataUrl, forespoerselID)
        .then((skjemadata) => {
          if (skjemadata.erBesvart === true && !erEndring) {
            router.replace(`/kvittering/${forespoerselID}`, undefined);
          } else {
            initState(skjemadata);
          }
        })
        .catch((error: any) => {
          if (error.status === 401) {
            logger.info('Mangler tilgang til å hente skjemadata i useHentSkjemadata', error.status);
            logger.info(error.status, error.message, error.info);

            if (window !== undefined) {
              const ingress = window.location.hostname + environment.baseUrl;
              const currentPath = window.location.href;

              window.location.replace(`https://${ingress}/oauth2/login?redirect=${encodeURIComponent(currentPath)}`);
            }
            return Promise.resolve({});
          }

          setSkjemaFeilet();

          logger.error('Feil ved henting av skjemadata i useHentSkjemadata', error.status);
          logger.error(error.status, error.message, error.info);

          slettFeilmelding('ukjent');
          leggTilFeilmelding('ukjent', feiltekster.SERVERFEIL_IM);
          setSkalViseFeilmeldinger(true);
        });
    } else {
      return Promise.resolve({});
    }
  };
}

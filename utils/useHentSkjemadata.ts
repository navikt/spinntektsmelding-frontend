import environment from '../config/environment';
import useBoundStore from '../state/useBoundStore';
import fetchInntektskjemaForNotifikasjon from '../state/fetchInntektskjemaForNotifikasjon';
import useStateInit from '../state/useStateInit';
import feiltekster from './feiltekster';
import { useRouter } from 'next/navigation';
import { Opplysningstype } from '../state/useForespurtDataStore';
import foresporselType from '../config/foresporseltype';
import { logger } from '@navikt/next-logger';

export default function useHentSkjemadata() {
  const initState = useStateInit();
  const [leggTilFeilmelding, slettFeilmelding] = useBoundStore((state) => [
    state.leggTilFeilmelding,
    state.slettFeilmelding
  ]);
  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);
  const setSkjemaFeilet = useBoundStore((state) => state.setSkjemaFeilet);
  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const router = useRouter();

  return (forespoerselID: string | Array<string>, erEndring: boolean) => {
    if (Array.isArray(forespoerselID)) {
      return Promise.resolve({});
    }

    if (forespoerselID) {
      return fetchInntektskjemaForNotifikasjon(environment.skjemadataUrl, forespoerselID)
        .then((skjemadata) => {
          if (skjemadata.erBesvart === true && !erEndring) {
            router.replace(`/kvittering/${forespoerselID}`, undefined);
          } else {
            initState(skjemadata);
            const opplysningstyper = hentPaakrevdOpplysningstyper();

            if (!isOpplysningstype(foresporselType.arbeidsgiverperiode, opplysningstyper)) {
              router.replace(`/endring/${forespoerselID}`, undefined);
            }
          }
        })
        .catch((error: any) => {
          if (error.status === 401) {
            const ingress = window.location.hostname + environment.baseUrl;
            const currentPath = window.location.href;
            logger.info('Mangler tilgang til å hente skjemadata i useHentSkjemadata', error.status);
            logger.info(error.status, error.message, error.info);

            logger.info('Mangler tilgang til å hente skjemadata i useHentSkjemadata', error.status);
            logger.info(error.status, error.message, error.info);

            window.location.replace(`https://${ingress}/oauth2/login?redirect=${encodeURIComponent(currentPath)}`);
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

function isOpplysningstype(value: string, opplysningstyper: (Opplysningstype | undefined)[]): value is Opplysningstype {
  return opplysningstyper.includes(value as Opplysningstype);
}

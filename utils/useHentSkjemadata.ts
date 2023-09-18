import environment from '../config/environment';
import useBoundStore from '../state/useBoundStore';
import fetchInntektskjemaForNotifikasjon from '../state/fetchInntektskjemaForNotifikasjon';
import useStateInit from '../state/useStateInit';
import feiltekster from './feiltekster';
import { useRouter } from 'next/router';
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

  return async (pathSlug: string | Array<string>) => {
    try {
      let skjemadata;
      if (Array.isArray(pathSlug)) {
        return {};
      }

      if (pathSlug) {
        skjemadata = await fetchInntektskjemaForNotifikasjon(environment.skjemadataUrl, pathSlug);
      }
      if (skjemadata) {
        initState(skjemadata);
        const opplysningstyper = hentPaakrevdOpplysningstyper();

        if (!isOpplysningstype(foresporselType.arbeidsgiverperiode, opplysningstyper)) {
          router.replace(`/endring/${pathSlug}`, undefined, { shallow: true });
        }
      }
    } catch (error: any) {
      if (error.status === 401) {
        const ingress = window.location.hostname + environment.baseUrl;
        const currentPath = window.location.href;

        window.location.replace(`https://${ingress}/oauth2/login?redirect=${encodeURIComponent(currentPath)}`);
      }

      if (error.status === 503 || error.status === 500) {
        setSkjemaFeilet();
      }

      logger.warn('Feil ved henting av skjemadata i useHentSkjemadata', error);
      logger.warn('Feil ved henting av skjemadata i useHentSkjemadata - info', error.info);
      slettFeilmelding('ukjent');
      leggTilFeilmelding('ukjent', feiltekster.SERVERFEIL_IM);
      setSkalViseFeilmeldinger(true);
    }
  };

  function isOpplysningstype(
    value: string,
    opplysningstyper: (Opplysningstype | undefined)[]
  ): value is Opplysningstype {
    return opplysningstyper.includes(value as Opplysningstype);
  }
}

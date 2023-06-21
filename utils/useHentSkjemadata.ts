import environment from '../config/environment';
import useBoundStore from '../state/useBoundStore';
import fetchInntektskjemaForNotifikasjon from '../state/fetchInntektskjemaForNotifikasjon';
import useStateInit from '../state/useStateInit';
import feiltekster from './feiltekster';
import { useRouter } from 'next/router';

export default function useHentSkjemadata() {
  const initState = useStateInit();
  const leggTilFeilmelding = useBoundStore((state) => state.leggTilFeilmelding);
  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);
  const setSkjemaFeilet = useBoundStore((state) => state.setSkjemaFeilet);
  const hentOpplysningstyper = useBoundStore((state) => state.hentOpplysningstyper);
  const router = useRouter();

  return async (pathSlug: string) => {
    try {
      let skjemadata;
      if (pathSlug) {
        skjemadata = await fetchInntektskjemaForNotifikasjon(environment.skjemadataUrl, pathSlug);
      }
      if (skjemadata) {
        initState(skjemadata);
        const opplysningstyper = hentOpplysningstyper();

        if (!opplysningstyper.includes('Arbeidsgiverperiode')) {
          router.push(`/endring/${pathSlug}`, undefined, { shallow: true });
        }
      }
    } catch (error: any) {
      if (error.status === 401) {
        const ingress = window.location.hostname + environment.baseUrl;
        const currentPath = window.location.href;

        window.location.replace(`https://${ingress}/oauth2/login?redirect=${currentPath}`);
      }

      if (error.status === 503 || error.status === 500) {
        setSkjemaFeilet();
      }

      leggTilFeilmelding('ukjent', feiltekster.SERVERFEIL_IM);
      setSkalViseFeilmeldinger(true);
    }
  };
}

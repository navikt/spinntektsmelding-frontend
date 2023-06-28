import environment from '../config/environment';
import useBoundStore from '../state/useBoundStore';
import fetchInntektskjemaForNotifikasjon from '../state/fetchInntektskjemaForNotifikasjon';
import useStateInit from '../state/useStateInit';
import feiltekster from './feiltekster';

export default function useHentSkjemadata() {
  const initState = useStateInit();
  const leggTilFeilmelding = useBoundStore((state) => state.leggTilFeilmelding);
  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);
  const setSkjemaFeilet = useBoundStore((state) => state.setSkjemaFeilet);

  return async (pathSlug: string) => {
    try {
      let skjemadata;
      if (pathSlug) {
        skjemadata = await fetchInntektskjemaForNotifikasjon(environment.skjemadataUrl, pathSlug);
      }
      if (skjemadata) {
        initState(skjemadata);
      }
    } catch (error: any) {
      if (error.status === 401) {
        const ingress = window.location.hostname + environment.baseUrl;
        const currentPath = window.location.href;

        window.location.replace(`https://${ingress}/oauth2/login?redirect=${currentPath}`);
      }

      if (error.status === 503) {
        setSkjemaFeilet();
      }

      leggTilFeilmelding('ukjent', feiltekster.SERVERFEIL_IM);
      setSkalViseFeilmeldinger(true);
    }
  };
}

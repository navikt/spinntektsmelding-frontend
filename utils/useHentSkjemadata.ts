import environment from '../config/environment';
import useBoundStore from '../state/useBoundStore';
import useFetchInntektskjemaForNotifikasjon from '../state/useFetchInntektskjemaForNotifikasjon';
import useStateInit from '../state/useStateInit';
import feiltekster from './feiltekster';

export default function useHentSkjemadata() {
  const hentSkjemadata = useFetchInntektskjemaForNotifikasjon('');
  const initState = useStateInit();
  const leggTilFeilmelding = useBoundStore((state) => state.leggTilFeilmelding);

  return async (pathSlug: string) => {
    try {
      let skjemadata;
      if (pathSlug) {
        skjemadata = await hentSkjemadata(environment.skjemadataUrl, pathSlug);
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

      leggTilFeilmelding('ukjent', feiltekster.SERVERFEIL_IM);
    }
  };
}

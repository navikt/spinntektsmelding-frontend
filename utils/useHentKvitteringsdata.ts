import { useRouter } from 'next/router';
import environment from '../config/environment';
import fetchKvitteringsdata from './fetchKvitteringsdata';
import useHentSkjemadata from './useHentSkjemadata';
import useKvitteringInit from '../state/useKvitteringInit';

export default function useHentKvitteringsdata() {
  const initState = useKvitteringInit();
  const hentSkjemadata = useHentSkjemadata();
  const router = useRouter();

  return async (pathSlug: string) => {
    try {
      let skjemadata;
      if (pathSlug) {
        skjemadata = await fetchKvitteringsdata(environment.hentKvitteringUrl, pathSlug);
      }
      if (skjemadata) {
        initState(skjemadata, pathSlug);
        router.push(`/kvittering/${pathSlug}`, undefined, { shallow: true });
      }
    } catch (error: any) {
      if (error.status === 401) {
        const ingress = window.location.hostname + environment.baseUrl;
        const currentPath = window.location.href;

        window.location.replace(`https://${ingress}/oauth2/login?redirect=${currentPath}`);
      }

      if (error.status === 404) {
        hentSkjemadata(pathSlug);
      }
    }
  };
}

import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherSkjemadataForespurt from './fetcherSkjemadataForespurt';
import isValidUUID from './isValidUUID';

function useSkjemadataForespurt(forespoerselId: string, skalHenteData: boolean) {
  return useSWRImmutable(
    [environment.skjemadataUrl, forespoerselId],
    ([url, forespoerselId]) =>
      fetcherSkjemadataForespurt(isValidUUID(forespoerselId) && skalHenteData ? url : null, forespoerselId),
    {
      onError: (err) => {
        console.error('Kunne ikke hente forespurte skjemadata', err);
        if (err.status === 401) {
          const ingress = window.location.hostname + environment.baseUrl;
          const currentPath = window.location.href;

          window.location.replace(`https://${ingress}/oauth2/login?redirect=${currentPath}`);
        }

        // if (err.status !== 200) {
        //   backendFeil.current.push({
        //     felt: 'Backend',
        //     text: 'Kunne ikke hente arbeidsforhold'
        //   });
        // }
      },
      refreshInterval: 0,
      shouldRetryOnError: false
    }
  );
}

export default useSkjemadataForespurt;

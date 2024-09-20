import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherEksisterendeForespoersel from './fetcherEksisterendeForespoersel';

function useEksisterendeForespoersel(forespoerselId: string, skalHenteInntektsdata: boolean) {
  return useSWRImmutable(
    [environment.inntektsmeldingUuidAPI, forespoerselId],
    ([url, forespoerselId]) => fetcherEksisterendeForespoersel(skalHenteInntektsdata ? url : null, forespoerselId),
    {
      onError: (err) => {
        console.error('Kunne ikke hente eksisterende forespørsel', err);
        // if (err.status === 401) {
        //   const ingress = window.location.hostname + environment.baseUrl;
        //   const currentPath = window.location.href;

        //   window.location.replace(`https://${ingress}/oauth2/login?redirect=${currentPath}`);
        // }

        // if (err.status !== 200) {
        //   backendFeil.current.push({
        //     felt: 'Backend',
        //     text: 'Kunne ikke hente arbeidsforhold'
        //   });
        // }
      },
      refreshInterval: 0,
      revalidateOnMount: true
    }
  );
}

export default useEksisterendeForespoersel;

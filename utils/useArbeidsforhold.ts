import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherArbeidsforhold from './fetcherArbeidsforhold';

export default function useArbeidsforhold(identitetsnummer: string | undefined, backendFeil: any) {
  return useSWRImmutable(
    [environment.initierBlankSkjemaUrl, identitetsnummer],
    ([url, idToken]) => fetcherArbeidsforhold(!!identitetsnummer ? url : null, idToken),
    {
      onError: (err) => {
        if (err.status === 401) {
          const ingress = window.location.hostname + environment.baseUrl;
          const currentPath = window.location.href;

          window.location.replace(`https://${ingress}/oauth2/login?redirect=${ingress}/initiering`);
        }

        if (err.status === 404) {
          backendFeil.current.push({
            felt: 'Backend',
            text: 'Kunne ikke finne arbeidsforhold for personen, sjekk at du har tastet riktig personnummer'
          });
        } else if (err.status !== 200) {
          backendFeil.current.push({
            felt: 'Backend',
            text: 'Kunne ikke hente arbeidsforhold'
          });
        }
      },
      refreshInterval: 0,
      shouldRetryOnError: false
    }
  );
}

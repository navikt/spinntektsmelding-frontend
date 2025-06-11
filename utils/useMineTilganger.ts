import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherArbeidsgiverListe from './fetcherArbeidsgiverListe';
import { UseFormSetError } from 'react-hook-form';

export default function useArbeidsgiverListe(setError: UseFormSetError<any>) {
  return useSWRImmutable([environment.mineTilgangerUrl], ([url]) => fetcherArbeidsgiverListe(url), {
    onError: (err) => {
      if (err.status === 401) {
        const ingress = window.location.hostname + environment.baseUrl;

        window.location.replace(`https://${ingress}/oauth2/login?redirect=${ingress}/initiering`);
      }

      if (err.status === 404) {
        setError('arbeidsgiverListe', {
          type: 'manual',
          message: 'Kunne ikke finne arbeidsforhold for personen, sjekk at du har tastet riktig personnummer'
        });
      } else if (err.status !== 200) {
        setError('arbeidsgiverListe', {
          type: 'manual',
          message: 'Kunne ikke hente arbeidsforhold'
        });
      }
    },
    refreshInterval: 0,
    shouldRetryOnError: false
  });
}

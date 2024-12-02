import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherArbeidsforhold from './fetcherArbeidsforhold';
import { FieldError } from 'react-hook-form';

export default function useArbeidsforhold(
  identitetsnummer: string | undefined,
  setError: (name: string, error: FieldError, options?: { shouldFocus?: boolean | undefined }) => void
) {
  return useSWRImmutable(
    [environment.initierBlankSkjemaUrl, identitetsnummer],
    ([url, idToken]) => fetcherArbeidsforhold(!!identitetsnummer ? url : null, idToken),
    {
      onError: (err) => {
        if (err.status === 401) {
          const ingress = window.location.hostname + environment.baseUrl;

          window.location.replace(`https://${ingress}/oauth2/login?redirect=${ingress}/initiering`);
        }

        if (err.status === 404) {
          setError('sykepengePeriodeId', {
            type: 'manual',
            message: 'Kunne ikke finne arbeidsforhold for personen, sjekk at du har tastet riktig personnummer'
          });
        } else if (err.status !== 200) {
          setError('sykepengePeriodeId', {
            type: 'manual',
            message: 'Kunne ikke hente arbeidsforhold'
          });
        }
      },
      refreshInterval: 0,
      shouldRetryOnError: false
    }
  );
}

import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherArbeidsforhold from './fetcherArbeidsforhold';
import { UseFormSetError } from 'react-hook-form';
import { buildFormOnError } from './buildFormOnError';
import { commonSWRFormOptions } from './commonSWRFormOptions';
import { buildSWRFormErrorHandler } from './buildSWRFormErrorHandler';
import { redirectToLogin } from './redirectToLogin';

export default function useArbeidsforhold(
  identitetsnummer: string | undefined,
  setError: UseFormSetError<any> // (name: string, error: FieldError, options?: { shouldFocus: boolean | undefined }) => void
) {
  return useSWRImmutable(
    [environment.initierBlankSkjemaUrl, identitetsnummer],
    ([url, idToken]) => fetcherArbeidsforhold(identitetsnummer ? url : null, idToken),
    {
      onError: buildSWRFormErrorHandler({
        setError,
        field: 'arbeidsgiverListe',
        messages: {
          unauthorized: 'Mangler tilgang til den aktuelle organisasjonen',
          notFound: 'Kunne ikke finne arbeidsforhold for personen, sjekk at du har tastet riktig fødselsnummer',
          default: 'Kunne ikke hente arbeidsforhold'
        },
        onUnauthorized: (err) => {
          redirectToLogin('/initiering');
        }
      }),
      ...commonSWRFormOptions
    }
  );
}

import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherArbeidsforhold from './fetcherArbeidsforhold';
import { UseFormSetError } from 'react-hook-form';
import { buildFormOnError } from './buildFormOnError';
import { commonSWRFormOptions } from './commonSWRFormOptions';

export default function useArbeidsforhold(
  identitetsnummer: string | undefined,
  setError: UseFormSetError<any> // (name: string, error: FieldError, options?: { shouldFocus: boolean | undefined }) => void
) {
  return useSWRImmutable(
    [environment.initierBlankSkjemaUrl, identitetsnummer],
    ([url, idToken]) => fetcherArbeidsforhold(identitetsnummer ? url : null, idToken),
    {
      onError: buildFormOnError({
        setError,
        field: 'arbeidsgiverListe',
        notFoundMsg: 'Kunne ikke finne arbeidsforhold for personen, sjekk at du har tastet riktig fødselsnummer',
        genericMsg: 'Kunne ikke hente arbeidsforhold',
        redirectPath: '/initiering'
      }),
      ...commonSWRFormOptions
    }
  );
}

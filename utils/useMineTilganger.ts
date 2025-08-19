import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherArbeidsgiverListe from './fetcherArbeidsgiverListe';
import { UseFormSetError } from 'react-hook-form';
import { buildFormOnError } from './buildFormOnError';
import { commonSWRFormOptions } from './commonSWRFormOptions';

export default function useMineTilganger(setError: UseFormSetError<any>) {
  return useSWRImmutable([environment.mineTilgangerUrl], ([url]) => fetcherArbeidsgiverListe(url), {
    onError: buildFormOnError({
      setError,
      field: 'arbeidsgiverListe',
      notFoundMsg: 'Kunne ikke finne arbeidsforhold for personen, sjekk at du har tastet riktig fødselsnummer',
      genericMsg: 'Kunne ikke hente arbeidsforhold',
      redirectPath: '/initiering'
    }),
    ...commonSWRFormOptions
  });
}

import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherArbeidsgiverListe from './fetcherArbeidsgiverListe';
import { UseFormSetError } from 'react-hook-form';
import { buildFormOnError } from './buildFormOnError';
import { commonSWRFormOptions } from './commonSWRFormOptions';
import { buildSWRFormErrorHandler } from './buildSWRFormErrorHandler';
import { redirectToLogin } from './redirectToLogin';

export default function useMineTilganger(setError: UseFormSetError<any>) {
  return useSWRImmutable([environment.mineTilgangerUrl], ([url]) => fetcherArbeidsgiverListe(url), {
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
  });
}

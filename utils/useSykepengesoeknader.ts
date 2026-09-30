import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherSykepengesoeknader from './fetcherSykepengesoeknader';
import { commonSWRFormOptions } from './commonSWRFormOptions';
import { buildSWRFormErrorHandler } from './buildSWRFormErrorHandler';
import { UseFormSetError } from 'react-hook-form';

export default function useSykepengesoeknader(
  identitetsnummer: string | undefined,
  orgNummer: string,
  setError: UseFormSetError<any> | undefined
) {
  return useSWRImmutable(
    [environment.hentSykepengesoknaderUrl, identitetsnummer, orgNummer],
    ([url, identitetsnummer, orgNummer]) =>
      fetcherSykepengesoeknader(!!identitetsnummer && !!orgNummer ? url : null, identitetsnummer, orgNummer),
    {
      onError: setError
        ? buildSWRFormErrorHandler({
            setError,
            field: 'sykepengePeriodeId',
            messages: {
              unauthorized: 'Mangler tilgang til den aktuelle organisasjonen',
              notFound: 'Kunne ikke finne arbeidsforhold for personen, sjekk at du har tastet riktig fødselsnummer',
              default: 'Kunne ikke hente sykepengesøknader'
            }
          })
        : () => undefined,
      ...commonSWRFormOptions
    }
  );
}

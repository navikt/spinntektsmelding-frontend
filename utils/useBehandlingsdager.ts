import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherSykepengesoeknader from './fetcherSykepengesoeknader';
import { commonSWRFormOptions } from './commonSWRFormOptions';
import { buildSWRFormErrorHandler } from './buildSWRFormErrorHandler';

export default function useBehandlingsdager(
  identitetsnummer: string | undefined,
  orgNummer: string,
  eldsteFom: string,
  setError: any
) {
  return useSWRImmutable(
    [environment.hentBehandlingsdagerUrl, identitetsnummer, orgNummer, eldsteFom],
    ([url, identitetsnummer, orgNummer, eldsteFom]) =>
      fetcherSykepengesoeknader(
        !!identitetsnummer && !!orgNummer && !!eldsteFom ? url : null,
        identitetsnummer,
        orgNummer,
        eldsteFom
      ),
    {
      onError: buildSWRFormErrorHandler({
        setError,
        field: 'sykepengerBehandlingsdager',
        messages: {
          unauthorized: 'Mangler tilgang til den aktuelle organisasjonen',
          notFound: 'Kunne ikke finne arbeidsforhold for personen, sjekk at du har tastet riktig fødselsnummer',
          default: 'Kunne ikke hente sykepengesøknader'
        }
      }),
      ...commonSWRFormOptions
    }
  );
}

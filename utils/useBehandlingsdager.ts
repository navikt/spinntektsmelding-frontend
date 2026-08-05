import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherSykepengesoeknader from './fetcherSykepengesoeknader';
import { commonSWRFormOptions } from './commonSWRFormOptions';
import { buildSWRFormErrorHandler } from './buildSWRFormErrorHandler';

export default function useBehandlingsdager(
  identitetsnummer: string | undefined,
  orgNummer: string,
  eldsteFom: string | undefined,
  setError: any
) {
  return useSWRImmutable(
    identitetsnummer && orgNummer && orgNummer !== '-' && eldsteFom
      ? [environment.hentBehandlingsdagerUrl, identitetsnummer, orgNummer, eldsteFom]
      : null,
    ([url, identitetsnummer, orgNummer, eldsteFom]) =>
      fetcherSykepengesoeknader(url, identitetsnummer, orgNummer, eldsteFom),
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

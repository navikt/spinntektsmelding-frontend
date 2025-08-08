import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherSykepengesoeknader from './fetcherSykepengesoeknader';

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
      onError: (err) => {
        if (err.status === 401) {
          setError('sykepengerBehandlingsdager', {
            type: 'manual',
            error: 'Mangler tilgang til den aktuelle organisasjonen'
          });
        }

        if (err.status === 404) {
          setError('sykepengerBehandlingsdager', {
            type: 'manual',
            error: 'Kunne ikke finne arbeidsforhold for personen, sjekk at du har tastet riktig personnummer'
          });
        } else if (err.status !== 200) {
          setError('sykepengerBehandlingsdager', {
            type: 'manual',
            error: 'Kunne ikke hente sykepengesøknader'
          });
        }
      },
      refreshInterval: 0,
      shouldRetryOnError: false
    }
  );
}

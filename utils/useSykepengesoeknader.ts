import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherSykepengesoeknader from './fetcherSykepengesoeknader';

export default function useSykepengesoeknader(
  identitetsnummer: string | undefined,
  orgNummer: string,
  eldsteFom: string,
  setError: any
) {
  return useSWRImmutable(
    [environment.hentSykepengesoknaderUrl, identitetsnummer, orgNummer, eldsteFom],
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
          setError('sykepengePeriodeId', {
            type: 'manual',
            message: 'Mangler tilgang til den aktuelle organisasjonen'
          });
        }

        if (err.status === 404) {
          setError('sykepengePeriodeId', {
            type: 'manual',
            message: 'Kunne ikke finne arbeidsforhold for personen, sjekk at du har tastet riktig personnummer'
          });
        } else if (err.status !== 200) {
          setError('sykepengePeriodeId', {
            type: 'manual',
            message: 'Kunne ikke hente sykepengesøknader'
          });
        }
      },
      refreshInterval: 0,
      shouldRetryOnError: false
    }
  );
}

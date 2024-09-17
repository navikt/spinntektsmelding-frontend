import { z } from 'zod';
import NetworkError from './NetworkError';
import { endepunktSykepengesoeknaderSchema } from '../schema/endepunktSykepengesoeknaderSchema';

type EndepunktSykepengesoeknader = z.infer<typeof endepunktSykepengesoeknaderSchema>;

export default function fetcherSykepengesoeknader(
  url: string | null,
  identitetsnummer?: string,
  orgnummer?: string,
  eldsteFom?: string
): Promise<EndepunktSykepengesoeknader> {
  if (!url || !identitetsnummer || !orgnummer || !eldsteFom || orgnummer === '-') return Promise.resolve([]);

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fnr: identitetsnummer, orgnummer, eldsteFom })
  })
    .then((res) => {
      if (!res.ok) {
        const error = new NetworkError('Kunne ikke hente sykepengesøknader, vennligst prøv igjen senere');
        error.status = res.status;
        error.info = res.json();
        throw error;
      }
      return res.json();
    })
    .catch((error) => {
      const newError = new NetworkError('Kunne ikke tolke resultatet fra serveren');
      newError.status = error.status;
      newError.info = error.info;
      throw newError;
    });
}

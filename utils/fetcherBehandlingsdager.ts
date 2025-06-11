import { z } from 'zod';
import NetworkError from './NetworkError';
import { EndepunktSykepengesoeknaderSchema } from '../schema/EndepunktSykepengesoeknaderSchema';

type EndepunktSykepengesoeknader = z.infer<typeof EndepunktSykepengesoeknaderSchema>;

export default function fetcherSykepengesoeknader(
  url: string | null,
  identitetsnummer?: string,
  orgNummer?: string,
  eldsteFom?: string
): Promise<EndepunktSykepengesoeknader> {
  if (!url || !identitetsnummer || !orgNummer || !eldsteFom || orgNummer === '-') return Promise.resolve([]);

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fnr: identitetsnummer, orgnummer: orgNummer, eldsteFom })
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

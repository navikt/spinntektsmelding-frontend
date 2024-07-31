import { z } from 'zod';
import NetworkError from './NetworkError';

export default function fetcherSykepengesoeknader(
  url: string | null,
  identitetsnummer?: string,
  orgnummer?: string,
  eldsteFom?: string
) {
  if (!url || !identitetsnummer || !orgnummer || !eldsteFom) return Promise.resolve([]);

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

const ISO_DATE_REGEX = /\d{4}-[01]\d-[0-3]\d/;

export const endepunktSykepengesoeknaderSchema = z.object({
  sykepengesoknadUuid: z.string(),
  fom: z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'),
  tom: z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'),
  sykmeldingId: z.string(),
  status: z.string(),
  startSykeforlop: z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'),
  egenmeldingsdagerFraSykmelding: z.array(z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format')).optional()
});

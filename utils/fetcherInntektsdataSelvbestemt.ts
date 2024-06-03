import { z } from 'zod';
import { OrganisasjonsnummerSchema } from '../validators/validerAapenInnsending';
import NetworkError from './NetworkError';

import formatIsoDate from './formatIsoDate';

export default function fetcherInntektsdataSelvbestemt(
  url: string,
  identitetsnummer?: string,
  orgnrUnderenhet?: string,
  inntektsdato?: Date
) {
  if (!identitetsnummer) return Promise.resolve([]);
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sykmeldtFnr: identitetsnummer,
      orgnr: orgnrUnderenhet,
      inntektsdato: formatIsoDate(inntektsdato)
    })
  })
    .then((res) => {
      if (!res.ok) {
        const error = new NetworkError('Kunne ikke hente arbeidsforhold, vennligst prøv igjen senere');
        error.status = res.status;
        // error.info = res.json();
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

// const ISO_DATE_REGEX = /\d{4}-[01]\d-[0-3]\d/;

// export const endepunktArbeidsforholdSchema = z.object({
//   fulltNavn: z.string(),
//   underenheter: z.array(
//     z
//       .object({
//         orgnrUnderenhet: OrganisasjonsnummerSchema,
//         virksomhetsnavn: z.string()
//       })
//       .optional()
//   ),
//   perioder: z
//     .array(
//       z.object({
//         fom: z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'),
//         tom: z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'),
//         id: z.string()
//       })
//     )
//     .optional(),
//   feilReport: z
//     .object({
//       feil: z.array(z.object({ melding: z.string() }))
//     })
//     .optional()
// });

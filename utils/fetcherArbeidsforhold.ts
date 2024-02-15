import { z } from 'zod';
import { OrganisasjonsnummerSchema } from '../validators/validerAapenInnsending';

export default function fetcherArbeidsforhold(url: string, identitetsnummer?: string) {
  if (!identitetsnummer) return Promise.resolve([]);
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ identitetsnummer })
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Kunne ikke hente arbeidsforhold');
      }
      return res.json();
    })
    .catch((error) => {
      throw error;
    });
}

export const endepunktArbeidsforholdSchema = z.object({
  fulltNavn: z.string(),
  underenheter: z.array(
    z
      .object({
        orgnrUnderenhet: OrganisasjonsnummerSchema,
        virksomhetsnavn: z.string()
      })
      .optional()
  ),
  feilReport: z
    .object({
      feil: z.array(z.object({ melding: z.string() }))
    })
    .optional()
});

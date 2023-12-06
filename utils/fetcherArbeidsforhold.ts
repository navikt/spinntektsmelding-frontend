import { z } from 'zod';

export default function fetcherArbeidsforhold(url: string, idToken?: string) {
  if (!idToken) return Promise.resolve([]);
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ idToken })
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
  underenheter: z.array(
    z
      .object({
        orgnrUnderenhet: z.string(),
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

import { z } from 'zod';
import { OrganisasjonsnummerSchema } from './OrganisasjonsnummerSchema';

const isoDate = z.iso.date('Dato er ikke i ISO-format');

export const EndepunktArbeidsforholdSchema = z.object({
  fulltNavn: z.string(),
  underenheter: z.array(
    z
      .object({
        orgnrUnderenhet: OrganisasjonsnummerSchema,
        virksomhetsnavn: z.string()
      })
      .optional()
  ),
  perioder: z
    .array(
      z.object({
        fom: isoDate,
        tom: isoDate,
        id: z.string()
      })
    )
    .optional()
});

import { z } from 'zod';
import { OrganisasjonsnummerSchema } from './OrganisasjonsnummerSchema';
import { ISO_DATE_REGEX } from './EndepunktSykepengesoeknaderSchema';

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
        fom: z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'),
        tom: z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'),
        id: z.string()
      })
    )
    .optional()
});

import z from 'zod/v4';
import { OrganisasjonsnummerSchema } from './OrganisasjonsnummerSchema';

export const AvsenderSchema = z.object({
  orgnr: OrganisasjonsnummerSchema,
  orgNavn: z.string(),
  navn: z.string()
});

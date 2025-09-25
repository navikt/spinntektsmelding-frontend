import z from 'zod';
import { OrganisasjonsnummerSchema } from './OrganisasjonsnummerSchema';

export const AvsenderSchema = z.object({
  orgnr: OrganisasjonsnummerSchema,
  orgNavn: z.string(),
  navn: z.string()
});

import { z } from 'zod/v4';
import { OrganisasjonsnummerSchema } from './OrganisasjonsnummerSchema';

export const InitieringAnnetSchema = z.object({
  fulltNavn: z.string().optional(),
  organisasjonsnummer: OrganisasjonsnummerSchema
});

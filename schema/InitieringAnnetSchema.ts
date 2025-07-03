import { z } from 'zod';
import { OrganisasjonsnummerSchema } from './OrganisasjonsnummerSchema';

export const InitieringAnnetSchema = z.object({
  fulltNavn: z.string().optional(),
  organisasjonsnummer: OrganisasjonsnummerSchema
});

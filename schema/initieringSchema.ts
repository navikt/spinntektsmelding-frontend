import { z } from 'zod';
import { OrganisasjonsnummerSchema, PersonnummerSchema } from '../validators/validerAapenInnsending';

export default z.object({
  organisasjonsnummer: OrganisasjonsnummerSchema,
  fulltNavn: z.string().min(1),
  personnummer: PersonnummerSchema
});

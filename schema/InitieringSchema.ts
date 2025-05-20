import { z } from 'zod';
import { PersonnummerSchema } from './PersonnummerSchema';
import { OrganisasjonsnummerSchema } from './OrganisasjonsnummerSchema';

export default z.object({
  organisasjonsnummer: OrganisasjonsnummerSchema.refine((val) => val.length < 19, {
    message: 'Organisasjonsnummeret mangler'
  }),
  fulltNavn: z.string().min(1),
  personnummer: PersonnummerSchema
});

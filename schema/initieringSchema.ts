import { z } from 'zod';
import { OrganisasjonsnummerSchema } from '../validators/validerAapenInnsending';
import { PeriodeSchema } from './periodeSchema';
import { PersonnummerSchema } from './personnummerSchema';

export default z.object({
  organisasjonsnummer: OrganisasjonsnummerSchema.refine((val) => val.length < 19, {
    message: 'Organisasjonsnummeret mangler'
  }),
  fulltNavn: z.string().min(1),
  personnummer: PersonnummerSchema,
  perioder: z.array(PeriodeSchema)
});

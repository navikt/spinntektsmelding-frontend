import { z } from 'zod';
import { OrganisasjonsnummerSchema, PersonnummerSchema } from '../validators/validerAapenInnsending';
import { PeriodeSchema } from '../validators/validerFulltSkjema';

export default z.object({
  organisasjonsnummer: OrganisasjonsnummerSchema,
  fulltNavn: z.string().min(1),
  personnummer: PersonnummerSchema,
  perioder: z.array(PeriodeSchema)
});

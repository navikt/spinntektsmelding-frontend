import { z } from 'zod';
import { PersonnummerSchema } from './personnummerSchema';
import { OrganisasjonsnummerSchema } from './organisasjonsnummerSchema';
import { TelefonNummerSchema } from './telefonNummerSchema';
import { PeriodeListeSchema } from './periodeListeSchema';
import { InnsendingSchema, superRefineInnsending } from './innsendingSchema';

const aapenInnsendingSchema = InnsendingSchema.extend({
  vedtaksperiodeId: z.string().uuid(),
  sykmeldtFnr: PersonnummerSchema,
  avsender: z.object({
    orgnr: OrganisasjonsnummerSchema,
    tlf: TelefonNummerSchema
  }),
  sykmeldingsperioder: PeriodeListeSchema
}).superRefine(superRefineInnsending);

export default aapenInnsendingSchema;

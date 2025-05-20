import { z } from 'zod';
import { PersonnummerSchema } from './PersonnummerSchema';
import { OrganisasjonsnummerSchema } from './OrganisasjonsnummerSchema';
import { TelefonNummerSchema } from './TelefonNummerSchema';
import { PeriodeListeSchema } from './PeriodeListeSchema';
import { InnsendingSchema, superRefineInnsending } from './InnsendingSchema';

const AapenInnsendingSchema = InnsendingSchema.extend({
  vedtaksperiodeId: z
    .string({ required_error: 'Dataene er på gammelt format og ikke mulig å sende inn' })
    .uuid()
    .nullable(),
  sykmeldtFnr: PersonnummerSchema,
  avsender: z.object({
    orgnr: OrganisasjonsnummerSchema,
    tlf: TelefonNummerSchema
  }),
  sykmeldingsperioder: PeriodeListeSchema
}).superRefine(superRefineInnsending);

export default AapenInnsendingSchema;

import { z } from 'zod';
import { PersonnummerSchema } from './PersonnummerSchema';
import { OrganisasjonsnummerSchema } from './OrganisasjonsnummerSchema';
import { TelefonNummerSchema } from './TelefonNummerSchema';
import { InnsendingSchema, superRefineInnsending } from './InnsendingSchema';
import { TypeArbeidsforholdSchema } from './TypeArbeidsforholdSchema';
import { ApiPeriodeSchema } from './ApiPeriodeSchema';

const AapenInnsendingSchema = InnsendingSchema.extend({
  sykmeldtFnr: PersonnummerSchema,
  avsender: z.object({
    orgnr: OrganisasjonsnummerSchema,
    tlf: TelefonNummerSchema
  }),
  sykmeldingsperioder: z.array(ApiPeriodeSchema).min(1, { message: 'Det må være minst én sykmeldingsperiode.' }),
  arbeidsforholdType: TypeArbeidsforholdSchema
}).superRefine(superRefineInnsending);

export default AapenInnsendingSchema;

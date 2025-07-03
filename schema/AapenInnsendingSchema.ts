import { z } from 'zod';
import { PersonnummerSchema } from './PersonnummerSchema';
import { OrganisasjonsnummerSchema } from './OrganisasjonsnummerSchema';
import { TelefonNummerSchema } from './TelefonNummerSchema';
import { PeriodeListeSchema } from './PeriodeListeSchema';
import { InnsendingSchema, superRefineInnsending } from './InnsendingSchema';
import { TypeArbeidsforholdSchema } from './TypeArbeidsforholdSchema';

const AapenInnsendingSchema = InnsendingSchema.extend({
  sykmeldtFnr: PersonnummerSchema,
  avsender: z.object({
    orgnr: OrganisasjonsnummerSchema,
    tlf: TelefonNummerSchema
  }),
  sykmeldingsperioder: PeriodeListeSchema,
  arbeidsforholdType: TypeArbeidsforholdSchema
}).superRefine(superRefineInnsending);

export default AapenInnsendingSchema;

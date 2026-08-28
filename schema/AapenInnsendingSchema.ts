import { z } from 'zod';
import { PersonnummerSchema } from './PersonnummerSchema';
import { OrganisasjonsnummerSchema } from './OrganisasjonsnummerSchema';
import { TelefonNummerSchema } from './TelefonNummerSchema';
import { InnsendingSchema, superRefineInnsending } from './InnsendingSchema';
import { TypeArbeidsforholdSchema } from './TypeArbeidsforholdSchema';
import { ApiPeriodeSchema } from './ApiPeriodeSchema';
import { isBefore } from 'date-fns';

const AapenInnsendingSchema = InnsendingSchema.extend({
  sykmeldtFnr: PersonnummerSchema,
  avsender: z.object({
    orgnr: OrganisasjonsnummerSchema,
    tlf: TelefonNummerSchema
  }),
  sykmeldingsperioder: z
    .array(ApiPeriodeSchema)
    .min(1, { message: 'Det må være minst én gyldig sykmeldingsperiode.' })
    .superRefine((perioder, ctx) => {
      perioder.forEach((periode) => {
        if (isBefore(periode.tom, periode.fom)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Til dato kan ikke være før fra dato.'
          });
        }
      });
      if (perioder.some((periode) => !periode.fom || !periode.tom)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Alle sykmeldingsperioder må ha både fra- og til-dato.'
        });
      }
    }),
  arbeidsforholdType: TypeArbeidsforholdSchema
}).superRefine(superRefineInnsending);

export default AapenInnsendingSchema;

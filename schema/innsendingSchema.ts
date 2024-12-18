import { z } from 'zod';

import { EndringAarsakSchema } from './apiEndringAarsakSchema';
import { apiPeriodeSchema } from './apiPeriodeSchema';
import { RefusjonEndringSchema } from './apiRefusjonEndringSchema';
import { NaturalytelseEnum } from './NaturalytelseEnum';
import { BegrunnelseRedusertLoennIAgp } from './begrunnelseRedusertLoennIAgp';

export const InnsendingSchema = z.object({
  agp: z
    .object({
      perioder: z.array(apiPeriodeSchema),
      egenmeldinger: z.union([z.array(apiPeriodeSchema), z.tuple([])]),
      redusertLoennIAgp: z.nullable(
        z.object({
          beloep: z.number().min(0),
          begrunnelse: z.enum(BegrunnelseRedusertLoennIAgp, {
            required_error: 'Vennligst velg en årsak til redusert lønn i arbeidsgiverperioden.'
          })
        })
      )
    })
    .nullable(),
  inntekt: z.optional(
    z.object({
      beloep: z
        .number({ required_error: 'Vennligst angi månedsinntekt' })
        .min(0, 'Månedsinntekt må være større enn eller lik 0'),
      inntektsdato: z.string({ required_error: 'Bestemmende fraværsdag mangler' }),
      naturalytelser: z.union([
        z.array(
          z.object({
            naturalytelse: NaturalytelseEnum,
            verdiBeloep: z.number().min(0),
            sluttdato: z.string().date()
          })
        ),
        z.tuple([])
      ]),
      endringAarsak: z.nullable(EndringAarsakSchema)
    })
  ),
  refusjon: z.nullable(
    z.object({
      beloepPerMaaned: z
        .number({ required_error: 'Vennligst angi hvor mye dere refundere per måned' })
        .min(0, 'Refusjonsbeløpet må være større enn eller lik 0'),
      endringer: z.union([z.array(RefusjonEndringSchema), z.tuple([])]),
      sluttdato: z
        .string({
          required_error: 'Vennligst fyll inn til dato',
          invalid_type_error: 'Dette er ikke en dato'
        })
        .date()
        .nullable()
    })
  )
});
// .superRefine((val, ctx) => {
//   if (val.inntekt?.beloep && val.refusjon?.beloepPerMaaned && val.inntekt?.beloep < val.refusjon?.beloepPerMaaned) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: 'Refusjonsbeløpet per måned må være lavere eller lik månedsinntekt.',
//       path: ['refusjon', 'beloepPerMaaned']
//     });
//   }
// });

type TInnsendingSchema = z.infer<typeof InnsendingSchema>;

export function superRefineInnsending(val: TInnsendingSchema, ctx: z.RefinementCtx) {
  if (val.inntekt?.beloep && val.refusjon?.beloepPerMaaned && val.inntekt?.beloep < val.refusjon?.beloepPerMaaned) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Refusjonsbeløpet per måned må være lavere eller lik månedsinntekt.',
      path: ['refusjon', 'beloepPerMaaned']
    });
  }

  const refusjonInnsendingsdatoer = val.refusjon?.endringer.map((endring) => endring.startdato);

  if (refusjonInnsendingsdatoer && new Set(refusjonInnsendingsdatoer).size !== refusjonInnsendingsdatoer.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Det er lagt inn flere refusjonsendringer på samme dato.',
      path: ['refusjon', 'endringer']
    });
  }

  if ((val.inntekt?.beloep ?? 0) < (val.agp?.redusertLoennIAgp?.beloep ?? 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Inntekten kan ikke være lavere enn utbetalingen under arbeidsgiverperioden.',
      path: ['agp', 'redusertLoennIAgp', 'beloep']
    });
  }
}

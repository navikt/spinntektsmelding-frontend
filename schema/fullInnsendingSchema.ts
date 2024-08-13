import { z } from 'zod';
import { isTlfNumber } from '../utils/isTlfNumber';

// import { EndringAarsakSchema } from './apiEndringAarsakSchema';
// import { apiPeriodeSchema } from './apiPeriodeSchema';
// import { RefusjonEndringSchema } from './apiRefusjonEndringSchema';
// import { NaturalytelseEnum } from './NaturalytelseEnum';
// import { BegrunnelseRedusertLoennIAgp } from './begrunnelseRedusertLoennIAgp';
import { InnsendingSchema, superRefineInnsending } from './innsendingSchema';

const fullInnsendingSchema = InnsendingSchema.extend({
  forespoerselId: z.string().uuid(),
  avsenderTlf: z
    .string({
      required_error: 'Vennligst fyll inn telefonnummer',
      invalid_type_error: 'Dette er ikke et telefonnummer'
    })
    .min(8, { message: 'Telefonnummeret er for kort, det må være 8 siffer' })
    .refine((val) => isTlfNumber(val), { message: 'Telefonnummeret er ikke gyldig' })
}).superRefine(superRefineInnsending);

// const fullInnsendingSchema = z
//   .object({
//     forespoerselId: z.string().uuid(),
//     avsenderTlf: z
//       .string({
//         required_error: 'Vennligst fyll inn telefonnummer',
//         invalid_type_error: 'Dette er ikke et telefonnummer'
//       })
//       .min(8, { message: 'Telefonnummeret er for kort, det må være 8 siffer' })
//       .refine((val) => isTlfNumber(val), { message: 'Telefonnummeret er ikke gyldig' }),
//     agp: z
//       .object({
//         perioder: z.array(apiPeriodeSchema),
//         egenmeldinger: z.union([z.array(apiPeriodeSchema), z.tuple([])]),
//         redusertLoennIAgp: z.nullable(
//           z.object({
//             beloep: z.number().min(0),
//             begrunnelse: z.enum(BegrunnelseRedusertLoennIAgp, {
//               required_error: 'Vennligst velg en årsak til redusert lønn i arbeidsgiverperioden.'
//             })
//           })
//         )
//       })
//       .nullable(),
//     inntekt: z.optional(
//       z.object({
//         beloep: z
//           .number({ required_error: 'Vennligst angi månedsinntekt' })
//           .min(0, 'Månedsinntekt må være større enn eller lik 0'),
//         inntektsdato: z.string({ required_error: 'Bestemmende fraværsdag mangler' }),
//         naturalytelser: z.union([
//           z.array(
//             z.object({
//               naturalytelse: NaturalytelseEnum,
//               verdiBeloep: z.number().min(0),
//               sluttdato: z.string().date()
//             })
//           ),
//           z.tuple([])
//         ]),
//         endringAarsak: z.nullable(EndringAarsakSchema)
//       })
//     ),
//     refusjon: z.nullable(
//       z.object({
//         beloepPerMaaned: z
//           .number({ required_error: 'Vennligst angi hvor mye dere refundere per måned' })
//           .min(0, 'Refusjonsbeløpet må være større enn eller lik 0'),
//         endringer: z.union([z.array(RefusjonEndringSchema), z.tuple([])]),
//         sluttdato: z
//           .string({
//             required_error: 'Vennligst fyll inn til dato',
//             invalid_type_error: 'Dette er ikke en dato'
//           })
//           .date()
//           .nullable()
//       })
//     )
//   })
//   .superRefine((val, ctx) => {
//     if (val.inntekt?.beloep && val.refusjon?.beloepPerMaaned && val.inntekt?.beloep < val.refusjon?.beloepPerMaaned) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: 'Refusjonsbeløpet per måned må være lavere eller lik månedsinntekt.',
//         path: ['refusjon', 'beloepPerMaaned']
//       });
//     }
//   });

export default fullInnsendingSchema;

import { z } from 'zod';

import { apiPeriodeSchema } from './apiPeriodeSchema';
import { PersonnummerSchema } from './personnummerSchema';
import { EndringAarsakSchema } from './endringAarsakSchema';
import { OrganisasjonsnummerSchema } from './organisasjonsnummerSchema';
import { TelefonNummerSchema } from './telefonNummerSchema';
import { toLocalIso } from '../utils/toLocalIso';
import { RefusjonEndringSchema } from './apiRefusjonEndringSchema';
import { PeriodeListeSchema } from './periodeListeSchema';
import { NaturalytelseEnum } from './NaturalytelseEnum';
import { BegrunnelseRedusertLoennIAgp } from './begrunnelseRedusertLoennIAgp';

const aapenInnsendingSchema = z
  .object({
    sykmeldtFnr: PersonnummerSchema,
    avsender: z.object({
      orgnr: OrganisasjonsnummerSchema,
      tlf: TelefonNummerSchema
    }),
    sykmeldingsperioder: PeriodeListeSchema,
    agp: z.object({
      perioder: z.array(apiPeriodeSchema),
      egenmeldinger: PeriodeListeSchema,
      redusertLoennIAgp: z.nullable(
        z
          .object({
            beloep: z.number({ required_error: 'Angi beløp utbetalt under arbeidsgiverperioden' }).min(0),
            begrunnelse: z.enum(BegrunnelseRedusertLoennIAgp, {
              required_error: 'Velg begrunnelse for kort arbeidsgiverperiode.'
            })
          })
          .refine((val) => val.beloep >= 0, { message: 'Beløpet må være større eller lik 0' })
      )
    }),
    inntekt: z.optional(
      z
        .object({
          beloep: z
            .number({ required_error: 'Vennligst angi månedsinntekt' })
            .min(0, 'Månedsinntekt må være større enn eller lik 0'),
          inntektsdato: z.string({ required_error: 'Bestemmende fraværsdag mangler' }),
          naturalytelser: z.union([
            z.array(
              z.object({
                naturalytelse: NaturalytelseEnum,
                verdiBeloep: z.number().min(0),
                sluttdato: z.date().transform((val) => toLocalIso(val))
              })
            ),
            z.tuple([])
          ]),
          endringAarsak: EndringAarsakSchema.nullable()
        })
        .optional()
    ),
    refusjon: z
      .object({
        beloepPerMaaned: z
          .number({ required_error: 'Vennligst angi hvor mye dere refundere per måned' })
          .min(0, 'Refusjonsbeløpet må være større enn eller lik 0'),
        endringer: z.array(RefusjonEndringSchema).or(
          z.tuple([], {
            errorMap: (error) => {
              if (error.code === z.ZodIssueCode.too_big) {
                return { message: 'Vennligst fyll inn endringer i refusjonsbeløpet i perioden' };
              }
              return { message: error.message ?? 'Ukjent feil' };
            }
          })
        ),
        sluttdato: z.string().date().nullable()
      })
      .nullable(),
    aarsakInnsending: z.enum(['Endring', 'Ny'])
  })
  .superRefine((val, ctx) => {
    if (val.inntekt?.beloep && val.refusjon?.beloepPerMaaned && val.inntekt?.beloep < val.refusjon?.beloepPerMaaned) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Refusjonsbeløpet per måned må være lavere eller lik månedsinntekt.',
        path: ['refusjon', 'beloepPerMaaned']
      });
    }
  });

export default aapenInnsendingSchema;

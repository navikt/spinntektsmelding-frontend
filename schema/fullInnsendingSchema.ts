import { z } from 'zod';
import { isTlfNumber } from '../utils/isTlfNumber';

import {
  EndringAarsakSchema,
  NaturalytelseEnum,
  BegrunnelseRedusertLoennIAgp
} from '../validators/validerAapenInnsending';

const RefusjonEndringSchema = z.object({
  startdato: z.string({ required_error: 'Vennligst fyll inn dato for endring i refusjon' }).date(),
  beloep: z
    .number({ required_error: 'Vennligst fyll inn beløpet for endret refusjon.' })
    .min(0, { message: 'Beløpet må være større enn eller lik 0' })
});

const PeriodeSchema = z
  .object({
    fom: z
      .string({
        required_error: 'Vennligst fyll inn fra dato',
        invalid_type_error: 'Dette er ikke en dato'
      })
      .date(),
    tom: z
      .string({
        required_error: 'Vennligst fyll inn til dato',
        invalid_type_error: 'Dette er ikke en dato'
      })
      .date()
  })
  .refine((val) => val.fom <= val.tom, { message: 'Fra dato må være før til dato', path: ['fom'] });

const fullInnsendingSchema = z.object({
  forespoerselId: z.string().uuid(),
  avsenderTlf: z
    .string({
      required_error: 'Vennligst fyll inn telefonnummer',
      invalid_type_error: 'Dette er ikke et telefonnummer'
    })
    .min(8, { message: 'Telefonnummeret er for kort, det må være 8 siffer' })
    .refine((val) => isTlfNumber(val), { message: 'Telefonnummeret er ikke gyldig' }),
  agp: z.object({
    perioder: z.array(PeriodeSchema),
    egenmeldinger: z.union([z.array(PeriodeSchema), z.tuple([])]),
    redusertLoennIAgp: z.nullable(
      z.object({
        beloep: z.number().min(0),
        begrunnelse: z.enum(BegrunnelseRedusertLoennIAgp, {
          required_error: 'Vennligst velg en årsak til redusert lønn i arbeidsgiverperioden.'
        })
      })
    )
  }),
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
            sluttdato: z.date()
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

export default fullInnsendingSchema;

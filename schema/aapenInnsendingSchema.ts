import { z } from 'zod';
import { isTlfNumber } from '../utils/isTlfNumber';
import feiltekster from '../utils/feiltekster';

import {
  EndringAarsakSchema,
  OrganisasjonsnummerSchema,
  PersonnummerSchema,
  NaturalytelseEnum,
  BegrunnelseRedusertLoennIAgp,
  PeriodeSchema,
  RefusjonEndringSchema
} from '../validators/validerAapenInnsending';

const PeriodeListeSchema = z.array(PeriodeSchema).transform((val, ctx) => {
  for (let i = 0; i < val.length - 1; i++) {
    const tom = new Date(val[i].tom);
    const fom = new Date(val[i + 1].fom);
    const forskjellMs = Number(tom) - Number(fom);
    const forskjellDager = Math.abs(Math.floor(forskjellMs / 1000 / 60 / 60 / 24));
    if (forskjellDager > 16) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: feiltekster.FOR_MANGE_DAGER_MELLOM
      });
    }
  }
  return val;
});

const aapenInnsendingSchema = z.object({
  sykmeldtFnr: PersonnummerSchema,
  avsender: z.object({
    orgnr: OrganisasjonsnummerSchema,
    tlf: z
      .string({
        required_error: 'Vennligst fyll inn telefonnummer',
        invalid_type_error: 'Dette er ikke et telefonnummer'
      })
      .min(8, { message: 'Telefonnummeret er for kort, det må være 8 siffer' })
      .refine((val) => isTlfNumber(val), { message: 'Telefonnummeret er ikke gyldig' })
  }),
  sykmeldingsperioder: PeriodeListeSchema,
  agp: z.object({
    perioder: z.array(PeriodeSchema),
    egenmeldinger: z.union([z.array(PeriodeSchema), z.tuple([])]),
    redusertLoennIAgp: z.optional(
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
      endringAarsak: z.optional(EndringAarsakSchema)
    })
  ),
  refusjon: z.optional(
    z.object({
      beloepPerMaaned: z
        .number({ required_error: 'Vennligst angi hvor mye dere refundere per måned' })
        .min(0, 'Refusjonsbeløpet må være større enn eller lik 0'),
      endringer: z.union([z.array(RefusjonEndringSchema), z.tuple([])]),
      sluttdato: z.date().nullable()
    })
  ),
  aarsakInnsending: z.enum(['Endring', 'Ny'])
});

export default aapenInnsendingSchema;

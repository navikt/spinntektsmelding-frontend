import { z } from 'zod';
import { isTlfNumber } from '../utils/isTlfNumber';
import feiltekster from '../utils/feiltekster';
import {
  EndringAarsakSchema,
  OrganisasjonsnummerSchema,
  PersonnummerSchema,
  NaturalytelseEnum,
  toLocalIso,
  BegrunnelseRedusertLoennIAgp
} from './validerAapenInnsending';

export const PeriodeSchema = z
  .object({
    fom: z
      .date({
        required_error: 'Vennligst fyll inn fra dato',
        invalid_type_error: 'Dette er ikke en dato'
      })
      .transform((val) => toLocalIso(val)),
    tom: z
      .date({
        required_error: 'Vennligst fyll inn til dato',
        invalid_type_error: 'Dette er ikke en dato'
      })
      .transform((val) => toLocalIso(val))
  })
  .refine((val) => val.fom <= val.tom, { message: 'Fra dato må være før til dato', path: ['fom'] });

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

export const RefusjonEndringSchema = z.object({
  startDato: z
    .date({ required_error: 'Vennligst fyll inn dato for endring i refusjon' })
    .transform((val) => toLocalIso(val)),
  beloep: z
    .number({ required_error: 'Vennligst fyll inn beløpet for endret refusjon.' })
    .min(0, { message: 'Beløpet må være større enn eller lik 0' })
});

const schema = z.object({
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

type AapenInnsending = z.infer<typeof schema>;

export default function validerFulltSkjema(data: Partial<AapenInnsending>) {
  return schema.safeParse(data);
}

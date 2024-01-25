import { z } from 'zod';
import isFnrNumber from '../utils/isFnrNumber';
import isMod11Number from '../utils/isMod10Number';
import { isTlfNumber } from '../utils/isTlfNumber';

const NaturalytelseEnum = z.enum([
  'AKSJERGRUNNFONDSBEVISTILUNDERKURS',
  'ANNET',
  'BEDRIFTSBARNEHAGEPLASS',
  'BESOEKSREISERHJEMMETANNET',
  'BIL',
  'BOLIG',
  'ELEKTRONISKKOMMUNIKASJON',
  'FRITRANSPORT',
  'INNBETALINGTILUTENLANDSKPENSJONSORDNING',
  'KOSTBESPARELSEIHJEMMET',
  'KOSTDAGER',
  'KOSTDOEGN',
  'LOSJI',
  'OPSJONER',
  'RENTEFORDELLAAN',
  'SKATTEPLIKTIGDELFORSIKRINGER',
  'TILSKUDDBARNEHAGEPLASS',
  'YRKEBILTJENESTLIGBEHOVKILOMETER',
  'YRKEBILTJENESTLIGBEHOVLISTEPRIS'
]);

const BegrunnelseRedusertLoennIAgpEnum = z.enum([
  'ArbeidOpphoert',
  'BeskjedGittForSent',
  'BetvilerArbeidsufoerhet',
  'FerieEllerAvspasering',
  'FiskerMedHyre',
  'FravaerUtenGyldigGrunn',
  'IkkeFravaer',
  'IkkeFullStillingsandel',
  'IkkeLoenn',
  'LovligFravaer',
  'ManglerOpptjening',
  'Permittering',
  'Saerregler',
  'StreikEllerLockout',
  'TidligereVirksomhet'
]);

export const InntektEndringAarsakEnum = z.enum([
  'Bonus',
  'Feilregistrert',
  'Ferie',
  'Ferietrekk',
  'Nyansatt',
  'NyStilling',
  'NyStillingsprosent',
  'Permisjon',
  'Permittering',
  'Sykefravaer',
  'Tariffendring',
  'VarigLoennsendring'
]);

const PeriodeSchema = z.object({
  fom: z.date({
    required_error: 'Vennligst fyll inn fra dato',
    invalid_type_error: 'Dette er ikke en dato'
  }),
  tom: z.date({
    required_error: 'Vennligst fyll inn til dato',
    invalid_type_error: 'Dette er ikke en dato'
  })
});

const EndringAarsakBonusSchema = z.object({
  aarsak: z.literal('Bonus')
});

const EndringAarsakFeilregistrertSchema = z.object({
  aarsak: z.literal('Feilregistrert')
});

const EndringAarsakFerieSchema = z.object({
  aarsak: z.literal('Ferie'),
  perioder: z.array(PeriodeSchema)
});

const EndringAarsakFerietrekkSchema = z.object({
  aarsak: z.literal('Ferietrekk')
});

const EndringAarsakNyansattSchema = z.object({
  aarsak: z.literal('Nyansatt')
});

const EndringAarsakNyStillingSchema = z.object({
  aarsak: z.literal('NyStilling'),
  gjelderFra: z.date()
});

const EndringAarsakNyStillingsprosentSchema = z.object({
  aarsak: z.literal('NyStillingsprosent'),
  gjelderFra: z.date()
});

const EndringAarsakPermisjonSchema = z.object({
  aarsak: z.literal('Permisjon'),
  perioder: z.array(PeriodeSchema)
});

const EndringAarsakPermitteringSchema = z.object({
  aarsak: z.literal('Permittering'),
  perioder: z.array(PeriodeSchema)
});

const EndringAarsakSykefravaerSchema = z.object({
  aarsak: z.literal('Sykefravaer'),
  perioder: z.array(PeriodeSchema)
});

const EndringAarsakTariffendringSchema = z.object({
  aarsak: z.literal('Tariffendring'),
  gjelderFra: z.date(),
  bleKjent: z.date()
});

const EndringAarsakVarigLoennsendringSchema = z.object({
  aarsak: z.literal('VarigLoennsendring'),
  gjelderFra: z.date()
});

const EndringAarsakSchema = z.discriminatedUnion('aarsak', [
  EndringAarsakBonusSchema,
  EndringAarsakFeilregistrertSchema,
  EndringAarsakFerieSchema,
  EndringAarsakFerietrekkSchema,
  EndringAarsakNyansattSchema,
  EndringAarsakNyStillingSchema,
  EndringAarsakNyStillingsprosentSchema,
  EndringAarsakPermisjonSchema,
  EndringAarsakPermitteringSchema,
  EndringAarsakSykefravaerSchema,
  EndringAarsakTariffendringSchema,
  EndringAarsakVarigLoennsendringSchema
]);

const RefusjonEndringSchema = z.object({
  startDato: z.date(),
  beloep: z.number().min(0)
});

const schema = z.object({
  sykmeldtFnr: z
    .string()
    .transform((val) => val.replace(/\s/g, ''))
    .pipe(
      z
        .string()
        .min(11, { message: 'Personnummeret er for kort, det må være 11 siffer' })
        .max(11, { message: 'Personnummeret er for langt, det må være 11 siffer' })
    )
    .refine((val) => isFnrNumber(val), { message: 'Ugyldig personnummer', path: ['identitetsnummer'] }),
  avsender: z.object({
    orgnr: z
      .string()
      .transform((val) => val.replace(/\s/g, ''))
      .pipe(
        z
          .string()
          .min(9, { message: 'Organisasjonsnummeret er for kort, det må være 9 siffer' })
          .max(9, { message: 'Organisasjonsnummeret er for langt, det må være 9 siffer' })
      )
      .refine((val) => isMod11Number(val), { message: 'Velg arbeidsgiver', path: ['organisasjonsnummer'] }),
    tlf: z
      .string({
        required_error: 'Vennligst fyll inn telefonnummer',
        invalid_type_error: 'Dette er ikke et telefonnummer'
      })
      .min(8, { message: 'Telefonnummeret er for kort, det må være 8 siffer' })
      .refine((val) => isTlfNumber(val), { message: 'Telefonnummeret er ikke gyldig' })
  }),
  sykmeldingsperioder: z.array(PeriodeSchema),
  agp: z.object({
    perioder: z.array(PeriodeSchema),
    egenmeldinger: z.array(PeriodeSchema),
    redusertLoennIAgp: z.optional(
      z.object({
        beloep: z.number().min(0),
        begrunnelse: BegrunnelseRedusertLoennIAgpEnum
      })
    )
  }),
  inntekt: z.optional(
    z.object({
      beloep: z.number().min(0),
      inntektsdato: z.string({ required_error: 'Bestemmende fraværsdag mangler' }),
      naturalytelser: z.optional(
        z.array(
          z.object({
            naturalytelse: NaturalytelseEnum,
            verdiBeloep: z.number().min(0),
            sluttdato: z.date()
          })
        )
      ),
      endringAarsak: z.optional(EndringAarsakSchema)
    })
  ),
  refusjon: z.optional(
    z.object({
      beloepPerMaaned: z.number().min(0),
      endringer: z.optional(z.array(RefusjonEndringSchema)),
      sluttdato: z.date().nullable()
    })
  )
});

type AapenInnsending = z.infer<typeof schema>;

export default function validerAapenInnsending(data: Partial<AapenInnsending>) {
  return schema.safeParse(data);
}

export type EndringAarsak = z.infer<typeof EndringAarsakSchema>;

export type RefusjonEndring = z.infer<typeof RefusjonEndringSchema>;

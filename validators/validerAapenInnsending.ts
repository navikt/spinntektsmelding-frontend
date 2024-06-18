import { z } from 'zod';
import isFnrNumber from '../utils/isFnrNumber';
import isMod11Number from '../utils/isMod10Number';
import { isTlfNumber } from '../utils/isTlfNumber';
import feiltekster from '../utils/feiltekster';

export const NaturalytelseEnum = z.enum([
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

export const BegrunnelseRedusertLoennIAgpEnum = z.enum(
  [
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
  ],
  { required_error: 'Vennligst velg en årsak til redusert lønn i arbeidsgiverperioden.' }
);

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

const leftPad = (val: number) => {
  return val < 10 ? `0${val}` : val;
};

export const toLocalIso = (val: Date) => {
  return `${val.getFullYear()}-${leftPad(val.getMonth() + 1)}-${leftPad(val.getDate())}`;
};

const datoManglerFeilmelding = {
  required_error: 'Vennligst fyll inn fra dato',
  invalid_type_error: 'Dette er ikke en dato'
};

const SykPeriodeSchema = z
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

const SykPeriodeListeSchema = z.array(SykPeriodeSchema).transform((val, ctx) => {
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

const PeriodeSchema = z
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
const DatoValideringSchema = z.date(datoManglerFeilmelding).transform((val) => toLocalIso(val));

export const PersonnummerSchema = z
  .string()
  .transform((val) => val.replace(/\s/g, ''))
  .pipe(
    z
      .string()
      .min(11, { message: 'Personnummeret er for kort, det må være 11 siffer' })
      .max(11, { message: 'Personnummeret er for langt, det må være 11 siffer' })
      .refine((val) => isFnrNumber(val), { message: 'Ugyldig personnummer' })
  );

export const OrganisasjonsnummerSchema = z
  .string()
  .transform((val) => val.replace(/\s/g, ''))
  .pipe(
    z
      .string({
        required_error: 'Organisasjon er ikke valgt'
      })
      .min(9, { message: 'Organisasjonsnummeret er for kort, det må være 9 siffer' })
      .max(9, { message: 'Organisasjonsnummeret er for langt, det må være 9 siffer' })
      .refine((val) => isMod11Number(val), { message: 'Velg arbeidsgiver' })
  );

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

const EndringAarsakSammeSomSistSchema = z.object({
  aarsak: z.literal('SammeSomSist')
});

const EndringAarsakNyansattSchema = z.object({
  aarsak: z.literal('Nyansatt')
});

const EndringAarsakNyStillingSchema = z.object({
  aarsak: z.literal('NyStilling'),
  gjelderFra: DatoValideringSchema
});

const EndringAarsakNyStillingsprosentSchema = z.object({
  aarsak: z.literal('NyStillingsprosent'),
  gjelderFra: DatoValideringSchema
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
  gjelderFra: DatoValideringSchema,
  bleKjent: DatoValideringSchema
});

const EndringAarsakVarigLoennsendringSchema = z.object({
  aarsak: z.literal('VarigLoennsendring'),
  gjelderFra: DatoValideringSchema
});

export const EndringAarsakSchema = z.discriminatedUnion(
  'aarsak',
  [
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
    EndringAarsakVarigLoennsendringSchema,
    EndringAarsakSammeSomSistSchema
  ],
  {
    errorMap: (issue, ctx) => ({ message: 'Vennligst angi årsak for endringen.' })
  }
);

export const telefonNummerSchema = z
  .string({
    required_error: 'Vennligst fyll inn telefonnummer',
    invalid_type_error: 'Dette er ikke et telefonnummer'
  })
  .min(8, { message: 'Telefonnummeret er for kort, det må være 8 siffer' })
  .refine((val) => isTlfNumber(val), { message: 'Telefonnummeret er ikke gyldig' });

const RefusjonEndringSchema = z.object({
  startdato: z
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
    tlf: telefonNummerSchema
  }),
  sykmeldingsperioder: SykPeriodeListeSchema,
  agp: z.object({
    perioder: z.array(SykPeriodeSchema),
    egenmeldinger: SykPeriodeListeSchema,
    redusertLoennIAgp: z.nullable(
      z.object({
        beloep: z.number({ required_error: 'Angi beløp utbetalt under arbeidsgiverperioden' }).min(0),
        begrunnelse: BegrunnelseRedusertLoennIAgpEnum
      })
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
      endringer: z.union([z.array(RefusjonEndringSchema), z.tuple([])]),
      sluttdato: z
        .date()
        .transform((val) => toLocalIso(val))
        .nullable()
    })
    .nullable(),
  aarsakInnsending: z.enum(['Endring', 'Ny'])
});

export type AapenInnsending = z.infer<typeof schema>;

export default function validerAapenInnsending(data: Partial<AapenInnsending>) {
  return schema.safeParse(data);
}

export type EndringAarsak = z.infer<typeof EndringAarsakSchema>;

export type RefusjonEndring = z.infer<typeof RefusjonEndringSchema>;

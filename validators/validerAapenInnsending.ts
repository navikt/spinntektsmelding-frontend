import { z } from 'zod';
import feiltekster from '../utils/feiltekster';
import parseIsoDate from '../utils/parseIsoDate';
import { PersonnummerSchema } from '../schema/personnummerSchema';
import { EndringAarsakSchema } from '../schema/endringAarsakSchema';
import { OrganisasjonsnummerSchema } from '../schema/organisasjonsnummerSchema';
import { TelefonNummerSchema } from '../schema/telefonNummerSchema';
import { toLocalIso } from '../utils/toLocalIso';
import { RefusjonEndringSchema } from '../schema/apiRefusjonEndringSchema';
import { PeriodeSchema } from '../schema/apiPeriodeSchema';

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

export const BegrunnelseRedusertLoennIAgp = [
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
] as const;

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

const datoManglerFeilmelding = {
  required_error: 'Vennligst fyll inn fra dato',
  invalid_type_error: 'Dette er ikke en dato'
};

const SykPeriodeListeSchema = z.array(PeriodeSchema).transform((val, ctx) => {
  for (let i = 0; i < val.length - 1; i++) {
    const tom = parseIsoDate(val[i].tom);
    const fom = parseIsoDate(val[i + 1].fom);
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

const schema = z
  .object({
    sykmeldtFnr: PersonnummerSchema,
    avsender: z.object({
      orgnr: OrganisasjonsnummerSchema,
      tlf: TelefonNummerSchema
    }),
    sykmeldingsperioder: SykPeriodeListeSchema,
    agp: z.object({
      perioder: z.array(PeriodeSchema),
      egenmeldinger: SykPeriodeListeSchema,
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

export type AapenInnsending = z.infer<typeof schema>;

export default function validerAapenInnsending(data: Partial<AapenInnsending>) {
  return schema.safeParse(data);
}

export type EndringAarsak = z.infer<typeof EndringAarsakSchema>;

export type RefusjonEndring = z.infer<typeof RefusjonEndringSchema>;

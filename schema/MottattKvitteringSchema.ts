import { z } from 'zod/v4';
import { ApiPeriodeSchema } from './ApiPeriodeSchema';
import { PersonnummerSchema } from './PersonnummerSchema';
import { OrganisasjonsnummerSchema } from './OrganisasjonsnummerSchema';
import { TelefonNummerSchema } from './TelefonNummerSchema';
import { ApiEndringAarsakSchema } from './ApiEndringAarsakSchema';
import { RefusjonEndringSchema } from './ApiRefusjonEndringSchema';
import { ApiNaturalytelserSchema } from './ApiNaturalytelserSchema';
import { SykmeldtSchema } from './SykmeldtSchema';
import { AvsenderSchema } from './AvsenderSchema';

const MottattAvsenderSchema = AvsenderSchema.extend({
  orgNavn: z.string().min(1),
  navn: z.string().min(1),
  tlf: TelefonNummerSchema
});

export const KvitteringNavNoSchema = z.object({
  sykmeldt: SykmeldtSchema,
  avsender: MottattAvsenderSchema,
  sykmeldingsperioder: z.array(ApiPeriodeSchema),
  skjema: z.object({
    agp: z
      .object({
        perioder: z.array(ApiPeriodeSchema),
        egenmeldinger: z.array(ApiPeriodeSchema),
        redusertLoennIAgp: z
          .object({
            beloep: z.number().min(0),
            begrunnelse: z.string().min(1)
          })
          .nullable()
      })
      .nullable(),
    inntekt: z.object({
      beloep: z.number(),
      endringAarsak: ApiEndringAarsakSchema,
      inntektsdato: z.iso.date(),
      naturalytelser: ApiNaturalytelserSchema,
      endringAarsaker: z.array(ApiEndringAarsakSchema)
    }),
    refusjon: z
      .object({
        beloepPerMaaned: z.number(),
        sluttdato: z.iso.date({
          error: (issue) => (issue.input === undefined ? 'Sluttdato mangler' : 'Ugyldig sluttdato')
        }),
        endringer: z.union([z.array(RefusjonEndringSchema), z.tuple([])])
      })
      .nullable()
  }),
  mottatt: z.iso.date()
});

export const KvitteringEksternSchema = z.object({
  avsenderSystem: z.string(),
  referanse: z.string(),
  tidspunkt: z.date()
});

export const MottattKvitteringSchema = z.object({
  kvitteringDokument: z
    .object({
      orgnrUnderenhet: OrganisasjonsnummerSchema,
      identitetsnummer: PersonnummerSchema,
      fulltNavn: z.string().min(1),
      telefonnummer: TelefonNummerSchema,
      innsenderNavn: z.string().min(1),
      virksomhetNavn: z.string().min(1),
      egenmeldingsperioder: z.array(ApiPeriodeSchema),
      arbeidsgiverperioder: z.array(ApiPeriodeSchema),
      bestemmendeFraværsdag: z.string().min(1),
      fraværsperioder: z.array(ApiPeriodeSchema),
      inntekt: z.object({
        bekreftet: z.boolean(),
        beregnetInntekt: z.number(),
        manueltKorrigert: z.boolean()
      }),
      fullLønnIArbeidsgiverPerioden: z.object({
        utbetalerFullLønn: z.boolean()
      }),
      refusjon: z.object({
        utbetalerHeleEllerDeler: z.boolean()
      }),
      årsakInnsending: z.enum(['NY', 'ENDRING']),
      bekreftOpplysninger: z.boolean(),
      tidspunkt: z.string(),
      forespurtData: z.array(z.string())
    })
    .nullable(),
  kvitteringEkstern: KvitteringEksternSchema.nullable(),
  kvitteringNavNo: KvitteringNavNoSchema.nullable()
});

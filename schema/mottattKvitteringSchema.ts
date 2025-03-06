import { z } from 'zod';
import { apiPeriodeSchema } from './apiPeriodeSchema';
import { PersonnummerSchema } from './personnummerSchema';
import { OrganisasjonsnummerSchema } from './organisasjonsnummerSchema';
import { TelefonNummerSchema } from './telefonNummerSchema';
import { EndringAarsakSchema } from './apiEndringAarsakSchema';
import { RefusjonEndringSchema } from './apiRefusjonEndringSchema';
import { apiNaturalytelserSchema } from './apiNaturalytelserSchema';

export const kvitteringNavNoSchema = z.object({
  sykmeldt: z.object({
    navn: z.string().min(1),
    fnr: PersonnummerSchema
  }),
  avsender: z.object({
    orgnr: OrganisasjonsnummerSchema,
    orgNavn: z.string().min(1),
    navn: z.string().min(1),
    tlf: TelefonNummerSchema
  }),
  sykmeldingsperioder: z.array(apiPeriodeSchema),
  skjema: z.object({
    agp: z
      .object({
        perioder: z.array(apiPeriodeSchema),
        egenmeldinger: z.array(apiPeriodeSchema),
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
      endringAarsak: EndringAarsakSchema,
      inntektsdato: z.string().date(),
      naturalytelser: apiNaturalytelserSchema,
      endringsaarsaker: z.array(EndringAarsakSchema)
    }),
    refusjon: z
      .object({
        beloepPerMaaned: z.number(),
        sluttdato: z.string().date(),
        endringer: z.union([z.array(RefusjonEndringSchema), z.tuple([])])
      })
      .nullable()
  }),
  mottatt: z.string().date()
});

export const kvitteringEksternSchema = z.object({
  avsenderSystem: z.string(),
  referanse: z.string(),
  tidspunkt: z.date()
});

export default z.object({
  kvitteringDokument: z
    .object({
      orgnrUnderenhet: OrganisasjonsnummerSchema,
      identitetsnummer: PersonnummerSchema,
      fulltNavn: z.string().min(1),
      telefonnummer: z.string().min(1),
      innsenderNavn: z.string().min(1),
      virksomhetNavn: z.string().min(1),
      egenmeldingsperioder: z.array(apiPeriodeSchema),
      arbeidsgiverperioder: z.array(apiPeriodeSchema),
      bestemmendeFraværsdag: z.string().min(1),
      fraværsperioder: z.array(apiPeriodeSchema),
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
  kvitteringEkstern: kvitteringEksternSchema.nullable(),
  kvitteringNavNo: kvitteringNavNoSchema.nullable()
});

import { z } from 'zod';
import { ApiPeriodeSchema } from './ApiPeriodeSchema';
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
    forespoerselId: z.uuid(),
    avsenderTlf: TelefonNummerSchema,
    agp: z
      .object({
        perioder: z.array(ApiPeriodeSchema),
        redusertLoennIAgp: z
          .object({
            beloep: z.number().min(0),
            begrunnelse: z.string().min(1)
          })
          .nullable()
      })
      .nullable(),
    inntekt: z
      .object({
        beloep: z.number(),
        endringAarsak: ApiEndringAarsakSchema.nullish(),
        inntektsdato: z.iso.date(),
        naturalytelser: ApiNaturalytelserSchema.nullish(),
        endringAarsaker: z.array(ApiEndringAarsakSchema).nullish()
      })
      .nullable(),
    refusjon: z
      .object({
        beloepPerMaaned: z.number().nullable(),
        endringer: z.array(RefusjonEndringSchema)
      })
      .nullable(),
    naturalytelser: ApiNaturalytelserSchema.nullish(),
    flereArbeidsforhold: z
      .object({
        harLikLoenn: z.boolean(),
        erSykmeldtFraAlle: z.boolean(),
        arbeidsforhold: z.array(
          z.object({
            inkludertISykefravaer: z.boolean(),
            yrkesbeskrivelse: z.string(),
            stillingsprosent: z.number().min(0).max(100),
            inntekt: z.number().min(0)
          })
        )
      })
      .nullable()
      .default(null)
  }),
  mottatt: z.iso.datetime({ offset: true })
});

export const KvitteringNavNoInitSchema = KvitteringNavNoSchema.extend({
  skjema: KvitteringNavNoSchema.shape.skjema.partial({
    forespoerselId: true,
    avsenderTlf: true,
    flereArbeidsforhold: true
  }),
  avsender: AvsenderSchema.extend({
    navn: AvsenderSchema.shape.navn.optional(),
    tlf: TelefonNummerSchema
  })
});

export const MottattKvitteringSchema = z.object({
  kvitteringNavNo: KvitteringNavNoSchema.nullable(),
  visGeneriskKvittering: z.boolean().optional()
});

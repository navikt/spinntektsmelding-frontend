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
        endringer: z.array(RefusjonEndringSchema)
      })
      .nullable(),
    naturalytelser: ApiNaturalytelserSchema
  }),
  mottatt: z.iso.date()
});

export const KvitteringEksternSchema = z.object({
  avsenderSystem: z.string(),
  referanse: z.string(),
  tidspunkt: z.iso.datetime()
});

export const MottattKvitteringSchema = z.object({
  kvitteringEkstern: KvitteringEksternSchema.nullable(),
  kvitteringNavNo: KvitteringNavNoSchema.nullable()
});

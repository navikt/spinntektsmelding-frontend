import { z } from 'zod';
import { ApiPeriodeSchema } from './ApiPeriodeSchema';
import { SykmeldtSchema } from './SykmeldtSchema';
import { AvsenderSchema } from './AvsenderSchema';
import { TelefonNummerSchema } from './TelefonNummerSchema';
import { ApiNaturalytelserSchema } from './ApiNaturalytelserSchema';
import { ApiEndringAarsakSchema } from './ApiEndringAarsakSchema';
import { RefusjonEndringSchema } from './ApiRefusjonEndringSchema';

const SelvbestemtAvsenderSchema = AvsenderSchema.extend({
  tlf: TelefonNummerSchema
});

const SelvbestemtTypeSchema = z.object({
  type: z.string(),
  id: z.uuid()
});

const SelvbestemtAgpSchema = z
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
  .nullable();

const SelvbestemtInntektSchema = z.object({
  beloep: z.number(),
  inntektsdato: z.iso.date(),
  naturalytelser: ApiNaturalytelserSchema,
  endringAarsaker: z.array(ApiEndringAarsakSchema)
});

const SelvbestemtRefusjonSchema = z
  .object({
    beloepPerMaaned: z.number(),
    sluttdato: z.iso.date().nullable(),
    endringer: z.array(RefusjonEndringSchema)
  })
  .nullable();

const AarsakInnsendingSchema = z.enum(['Endring', 'Ny']);

export const SelvbestemtInntektsmeldingSchema = z.object({
  id: z.uuid(),
  type: SelvbestemtTypeSchema,
  sykmeldt: SykmeldtSchema,
  avsender: SelvbestemtAvsenderSchema,
  sykmeldingsperioder: z.array(ApiPeriodeSchema),
  agp: SelvbestemtAgpSchema,
  inntekt: SelvbestemtInntektSchema,
  refusjon: SelvbestemtRefusjonSchema,
  naturalytelser: ApiNaturalytelserSchema,
  aarsakInnsending: AarsakInnsendingSchema,
  mottatt: z.string().datetime({ offset: true })
});

export const SelvbestemtKvitteringSchema = z.object({
  selvbestemtInntektsmelding: SelvbestemtInntektsmeldingSchema
});

export type SelvbestemtKvittering = z.infer<typeof SelvbestemtKvitteringSchema>;

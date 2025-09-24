import { z } from 'zod';
import { ApiPeriodeSchema } from './ApiPeriodeSchema';
import {
  EndringAarsakBonusSchema,
  EndringAarsakFeilregistrertSchema,
  EndringAarsakFerieSchema,
  EndringAarsakFerietrekkSchema,
  EndringAarsakNyansattSchema,
  EndringAarsakNyStillingSchema,
  EndringAarsakNyStillingsprosentSchema,
  EndringAarsakPermisjonSchema,
  EndringAarsakPermitteringSchema,
  EndringAarsakSammeSomSistSchema,
  EndringAarsakSykefravaerSchema,
  EndringAarsakTariffendringSchema,
  EndringAarsakVarigLoennsendringSchema
} from './EndringAarsakSchema';

const apiEndringAarsakFerieSchema = EndringAarsakFerieSchema.extend(
  z.object({
    ferier: z.array(ApiPeriodeSchema)
  }).shape
);

const apiEndringAarsakPermisjonSchema = EndringAarsakPermisjonSchema.extend(
  z.object({
    permisjoner: z.array(ApiPeriodeSchema)
  }).shape
);

const apiEndringAarsakPermitteringSchema = EndringAarsakPermitteringSchema.extend(
  z.object({
    permitteringer: z.array(ApiPeriodeSchema)
  }).shape
);

const apiEndringAarsakSykefravaerSchema = EndringAarsakSykefravaerSchema.extend(
  z.object({
    sykefravaer: z.array(ApiPeriodeSchema)
  }).shape
);

const apiEndringAarsakNyStillingSchema = EndringAarsakNyStillingSchema.extend(
  z.object({
    gjelderFra: z.iso.date({
      error: (issue) => (issue.input === undefined ? 'Dato mangler' : 'Ugyldig dato')
    })
  }).shape
);

const apiEndringAarsakNyStillingsprosentSchema = EndringAarsakNyStillingsprosentSchema.extend(
  z.object({
    gjelderFra: z.iso.date({
      error: (issue) => (issue.input === undefined ? 'Dato mangler' : 'Ugyldig dato')
    })
  }).shape
);

const apiEndringAarsakTariffendringSchema = EndringAarsakTariffendringSchema.extend(
  z.object({
    gjelderFra: z.iso.date({
      error: (issue) => (issue.input === undefined ? 'Dato mangler' : 'Ugyldig dato')
    }),
    bleKjent: z.iso.date({
      error: (issue) => (issue.input === undefined ? 'Dato mangler' : 'Ugyldig dato')
    })
  }).shape
);

const apiEndringAarsakVarigLoennsendringSchema = EndringAarsakVarigLoennsendringSchema.extend(
  z.object({
    aarsak: z.literal('VarigLoennsendring'),
    gjelderFra: z.iso.date({
      error: (issue) => (issue.input === undefined ? 'Dato mangler' : 'Ugyldig dato')
    })
  }).shape
);

export const ApiEndringAarsakSchema = z.discriminatedUnion(
  'aarsak',
  [
    EndringAarsakBonusSchema,
    EndringAarsakFeilregistrertSchema,
    apiEndringAarsakFerieSchema,
    EndringAarsakFerietrekkSchema,
    EndringAarsakNyansattSchema,
    apiEndringAarsakNyStillingSchema,
    apiEndringAarsakNyStillingsprosentSchema,
    apiEndringAarsakPermisjonSchema,
    apiEndringAarsakPermitteringSchema,
    apiEndringAarsakSykefravaerSchema,
    apiEndringAarsakTariffendringSchema,
    apiEndringAarsakVarigLoennsendringSchema,
    EndringAarsakSammeSomSistSchema
  ],
  'Vennligst angi årsak til endringen.'
);

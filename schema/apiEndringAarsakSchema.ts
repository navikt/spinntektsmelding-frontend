import { z } from 'zod';
import { apiPeriodeSchema } from './apiPeriodeSchema';
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
} from './endringAarsakSchema';

const apiEndringAarsakFerieSchema = EndringAarsakFerieSchema.merge(
  z.object({
    ferier: z.array(apiPeriodeSchema)
  })
);

const apiEndringAarsakPermisjonSchema = EndringAarsakPermisjonSchema.merge(
  z.object({
    permisjoner: z.array(apiPeriodeSchema)
  })
);

const apiEndringAarsakPermitteringSchema = EndringAarsakPermitteringSchema.merge(
  z.object({
    permitteringer: z.array(apiPeriodeSchema)
  })
);

const apiEndringAarsakSykefravaerSchema = EndringAarsakSykefravaerSchema.merge(
  z.object({
    sykefravaer: z.array(apiPeriodeSchema)
  })
);

const apiEndringAarsakNyStillingSchema = EndringAarsakNyStillingSchema.merge(
  z.object({
    gjelderFra: z
      .string({
        required_error: 'Dato mangler',
        invalid_type_error: 'Ugyldig dato'
      })
      .date()
  })
);

const apiEndringAarsakNyStillingsprosentSchema = EndringAarsakNyStillingsprosentSchema.merge(
  z.object({
    gjelderFra: z
      .string({
        required_error: 'Dato mangler',
        invalid_type_error: 'Ugyldig dato'
      })
      .date()
  })
);

const apiEndringAarsakTariffendringSchema = EndringAarsakTariffendringSchema.merge(
  z.object({
    gjelderFra: z
      .string({
        required_error: 'Dato mangler',
        invalid_type_error: 'Ugyldig dato'
      })
      .date(),
    bleKjent: z
      .string({
        required_error: 'Dato mangler',
        invalid_type_error: 'Ugyldig dato'
      })
      .date()
  })
);

const apiEndringAarsakVarigLoennsendringSchema = EndringAarsakVarigLoennsendringSchema.merge(
  z.object({
    aarsak: z.literal('VarigLoennsendring'),
    gjelderFra: z
      .string({
        required_error: 'Dato mangler',
        invalid_type_error: 'Ugyldig dato'
      })
      .date()
  })
);

export const EndringAarsakSchema = z.discriminatedUnion(
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
  {
    errorMap: (issue, ctx) => ({ message: 'Vennligst angi årsak til endringen.' })
  }
);

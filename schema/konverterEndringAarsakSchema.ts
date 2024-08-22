import { z } from 'zod';
import { toLocalIso } from '../utils/toLocalIso';
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

const kEndringAarsakNyStillingSchema = EndringAarsakNyStillingSchema.merge(
  z.object({
    gjelderFra: z
      .date({
        required_error: 'Vennligst fyll inn fra dato',
        invalid_type_error: 'Dette er ikke en dato'
      })
      .transform((val) => toLocalIso(val))
  })
);

const kEndringAarsakNyStillingsprosentSchema = EndringAarsakNyStillingsprosentSchema.merge(
  z.object({
    gjelderFra: z
      .date({
        required_error: 'Vennligst fyll inn fra dato',
        invalid_type_error: 'Dette er ikke en dato'
      })
      .transform((val) => toLocalIso(val))
  })
);

const kEndringAarsakTariffendringSchema = EndringAarsakTariffendringSchema.merge(
  z.object({
    gjelderFra: z
      .date({
        required_error: 'Vennligst fyll inn fra dato',
        invalid_type_error: 'Dette er ikke en dato'
      })
      .transform((val) => toLocalIso(val)),
    bleKjent: z
      .date({
        required_error: 'Vennligst fyll inn fra dato',
        invalid_type_error: 'Dette er ikke en dato'
      })
      .transform((val) => toLocalIso(val))
  })
);

const kEndringAarsakVarigLoennsendringSchema = EndringAarsakVarigLoennsendringSchema.merge(
  z.object({
    gjelderFra: z
      .date({
        required_error: 'Vennligst fyll inn fra dato',
        invalid_type_error: 'Dette er ikke en dato'
      })
      .transform((val) => toLocalIso(val))
  })
);

export const konverterEndringAarsakSchema = z.discriminatedUnion(
  'aarsak',
  [
    EndringAarsakBonusSchema,
    EndringAarsakFeilregistrertSchema,
    EndringAarsakFerieSchema,
    EndringAarsakFerietrekkSchema,
    EndringAarsakNyansattSchema,
    kEndringAarsakNyStillingSchema,
    kEndringAarsakNyStillingsprosentSchema,
    EndringAarsakPermisjonSchema,
    EndringAarsakPermitteringSchema,
    EndringAarsakSykefravaerSchema,
    kEndringAarsakTariffendringSchema,
    kEndringAarsakVarigLoennsendringSchema,
    EndringAarsakSammeSomSistSchema
  ],
  {
    errorMap: (issue, ctx) => ({ message: 'Vennligst angi årsak for endringen.' })
  }
);

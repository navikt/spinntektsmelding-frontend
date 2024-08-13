import { z } from 'zod';
import { PeriodeSchema } from './apiPeriodeSchema';
import {
  EndringAarsakBonusSchema,
  EndringAarsakFeilregistrertSchema,
  EndringAarsakFerieSchema,
  EndringAarsakFerietrekkSchema,
  EndringAarsakNyansattSchema,
  EndringAarsakNyStillingSchema,
  EndringAarsakNyStillingsprosentSchema,
  EndringAarsakSammeSomSistSchema,
  EndringAarsakTariffendringSchema,
  EndringAarsakVarigLoennsendringSchema
} from './endringAarsakSchema';

const apiEndringAarsakFerieSchema = EndringAarsakFerieSchema.merge(
  z.object({
    ferier: z.array(PeriodeSchema)
  })
);

const EndringAarsakPermisjonSchema = z.object({
  aarsak: z.literal('Permisjon'),
  permisjoner: z.array(PeriodeSchema)
});

const EndringAarsakPermitteringSchema = z.object({
  aarsak: z.literal('Permittering'),
  permitteringer: z.array(PeriodeSchema)
});

const EndringAarsakSykefravaerSchema = z.object({
  aarsak: z.literal('Sykefravaer'),
  sykefravaer: z.array(PeriodeSchema)
});

export const EndringAarsakSchema = z.discriminatedUnion(
  'aarsak',
  [
    EndringAarsakBonusSchema,
    EndringAarsakFeilregistrertSchema,
    apiEndringAarsakFerieSchema,
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

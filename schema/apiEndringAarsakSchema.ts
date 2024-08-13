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
    apiEndringAarsakPermisjonSchema,
    apiEndringAarsakPermitteringSchema,
    apiEndringAarsakSykefravaerSchema,
    EndringAarsakTariffendringSchema,
    EndringAarsakVarigLoennsendringSchema,
    EndringAarsakSammeSomSistSchema
  ],
  {
    errorMap: (issue, ctx) => ({ message: 'Vennligst angi årsak for endringen.' })
  }
);

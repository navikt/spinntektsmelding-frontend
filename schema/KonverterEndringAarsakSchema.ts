import { z } from 'zod/v4';
import { PeriodeSchema } from './KonverterPeriodeSchema';
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
} from './EndringAarsakSchema';

const KonverterEndringAarsakFerieSchema = EndringAarsakFerieSchema.extend({
  ferier: z.array(PeriodeSchema)
});

const KonverterEndringAarsakNyStillingSchema = EndringAarsakNyStillingSchema.extend({
  gjelderFra: z
    .date({
      error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn fra dato' : 'Dette er ikke en dato')
    })
    .transform((val) => toLocalIso(val))
});

const KonverterEndringAarsakNyStillingsprosentSchema = EndringAarsakNyStillingsprosentSchema.extend({
  gjelderFra: z
    .date({
      error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn fra dato' : 'Dette er ikke en dato')
    })
    .transform((val) => toLocalIso(val))
});

const KonverterEndringAarsakPermisjonSchema = EndringAarsakPermisjonSchema.extend({
  permisjoner: z.array(PeriodeSchema)
});

const KonverterEndringAarsakPermitteringSchema = EndringAarsakPermitteringSchema.extend({
  permitteringer: z.array(PeriodeSchema)
});

const KonverterEndringAarsakSykefravaerSchema = EndringAarsakSykefravaerSchema.extend({
  sykefravaer: z.array(PeriodeSchema)
});

const KonverterEndringAarsakTariffendringSchema = EndringAarsakTariffendringSchema.extend({
  gjelderFra: z
    .date({
      error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn fra dato' : 'Dette er ikke en dato')
    })
    .transform((val) => toLocalIso(val)),
  bleKjent: z
    .date({
      error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn fra dato' : 'Dette er ikke en dato')
    })
    .transform((val) => toLocalIso(val))
});

const KonverterEndringAarsakVarigLoennsendringSchema = EndringAarsakVarigLoennsendringSchema.extend({
  gjelderFra: z
    .date({
      error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn fra dato' : 'Dette er ikke en dato')
    })
    .transform((val) => toLocalIso(val))
});

export const KonverterEndringAarsakSchema = z.discriminatedUnion(
  'aarsak',
  [
    EndringAarsakBonusSchema,
    EndringAarsakFeilregistrertSchema,
    KonverterEndringAarsakFerieSchema,
    EndringAarsakFerietrekkSchema,
    EndringAarsakNyansattSchema,
    KonverterEndringAarsakNyStillingSchema,
    KonverterEndringAarsakNyStillingsprosentSchema,
    KonverterEndringAarsakPermisjonSchema,
    KonverterEndringAarsakPermitteringSchema,
    KonverterEndringAarsakSykefravaerSchema,
    KonverterEndringAarsakTariffendringSchema,
    KonverterEndringAarsakVarigLoennsendringSchema,
    EndringAarsakSammeSomSistSchema
  ],
  {
    error: 'Vennligst angi årsak til endringen.1'
  }
);

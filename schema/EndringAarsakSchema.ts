import { z } from 'zod/v4';
import { PeriodeSchema } from './PeriodeSchema';

export const EndringAarsakBonusSchema = z.object({
  aarsak: z.literal('Bonus')
});

export const EndringAarsakFeilregistrertSchema = z.object({
  aarsak: z.literal('Feilregistrert')
});

export const EndringAarsakFerieSchema = z.object({
  aarsak: z.literal('Ferie'),
  ferier: z.array(PeriodeSchema)
});

export const EndringAarsakFerietrekkSchema = z.object({
  aarsak: z.literal('Ferietrekk')
});

export const EndringAarsakSammeSomSistSchema = z.object({
  aarsak: z.literal('SammeSomSist')
});

export const EndringAarsakNyansattSchema = z.object({
  aarsak: z.literal('Nyansatt')
});

export const EndringAarsakNyStillingSchema = z.object({
  aarsak: z.literal('NyStilling'),
  gjelderFra: z.date({
    error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn fra dato' : 'Dette er ikke en dato')
  })
});

export const EndringAarsakNyStillingsprosentSchema = z.object({
  aarsak: z.literal('NyStillingsprosent'),
  gjelderFra: z.date({
    error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn fra dato' : 'Dette er ikke en dato')
  })
});

export const EndringAarsakPermisjonSchema = z.object({
  aarsak: z.literal('Permisjon'),
  permisjoner: z.array(PeriodeSchema)
});

export const EndringAarsakPermitteringSchema = z.object({
  aarsak: z.literal('Permittering'),
  permitteringer: z.array(PeriodeSchema)
});

export const EndringAarsakSykefravaerSchema = z.object({
  aarsak: z.literal('Sykefravaer'),
  sykefravaer: z.array(PeriodeSchema)
});

export const EndringAarsakTariffendringSchema = z.object({
  aarsak: z.literal('Tariffendring'),
  gjelderFra: z.date({
    error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn fra dato' : 'Dette er ikke en dato')
  }),
  bleKjent: z.date({
    error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn fra dato' : 'Dette er ikke en dato')
  })
});

export const EndringAarsakVarigLoennsendringSchema = z.object({
  aarsak: z.literal('VarigLoennsendring'),
  gjelderFra: z.date({
    error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn fra dato' : 'Dette er ikke en dato')
  })
});

export const EndringAarsakSchema = z.discriminatedUnion(
  'aarsak',
  [
    EndringAarsakBonusSchema,
    EndringAarsakFeilregistrertSchema,
    EndringAarsakFerieSchema,
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
    error: (issue) => ({ error: 'Vennligst angi årsak til endringen.' })
  }
);

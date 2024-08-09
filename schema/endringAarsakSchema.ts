import { z } from 'zod';
import { PeriodeSchema } from './periodeSchema';

const EndringAarsakBonusSchema = z.object({
  aarsak: z.literal('Bonus')
});

const EndringAarsakFeilregistrertSchema = z.object({
  aarsak: z.literal('Feilregistrert')
});

const EndringAarsakFerieSchema = z.object({
  aarsak: z.literal('Ferie'),
  ferier: z.array(PeriodeSchema)
});

const EndringAarsakFerietrekkSchema = z.object({
  aarsak: z.literal('Ferietrekk')
});

const EndringAarsakSammeSomSistSchema = z.object({
  aarsak: z.literal('SammeSomSist')
});

const EndringAarsakNyansattSchema = z.object({
  aarsak: z.literal('Nyansatt')
});

const EndringAarsakNyStillingSchema = z.object({
  aarsak: z.literal('NyStilling'),
  gjelderFra: z.string().date()
});

const EndringAarsakNyStillingsprosentSchema = z.object({
  aarsak: z.literal('NyStillingsprosent'),
  gjelderFra: z.string().date()
});

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

const EndringAarsakTariffendringSchema = z.object({
  aarsak: z.literal('Tariffendring'),
  gjelderFra: z.string().date(),
  bleKjent: z.string().date()
});

const EndringAarsakVarigLoennsendringSchema = z.object({
  aarsak: z.literal('VarigLoennsendring'),
  gjelderFra: z.string().date()
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
    errorMap: (issue, ctx) => ({ message: 'Vennligst angi årsak for endringen.' })
  }
);

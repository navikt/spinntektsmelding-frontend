import { z } from 'zod';
import { ImportPeriodeSchema } from './importPeriodeSchema';

const EndringAarsakBonusSchema = z.object({
  aarsak: z.literal('Bonus')
});

const EndringAarsakFeilregistrertSchema = z.object({
  aarsak: z.literal('Feilregistrert')
});

const EndringAarsakFerieSchema = z.object({
  aarsak: z.literal('Ferie'),
  ferier: z.array(ImportPeriodeSchema)
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
  gjelderFra: z.coerce.date()
});

const EndringAarsakNyStillingsprosentSchema = z.object({
  aarsak: z.literal('NyStillingsprosent'),
  gjelderFra: z.coerce.date()
});

const EndringAarsakPermisjonSchema = z.object({
  aarsak: z.literal('Permisjon'),
  permisjoner: z.array(ImportPeriodeSchema)
});

const EndringAarsakPermitteringSchema = z.object({
  aarsak: z.literal('Permittering'),
  permitteringer: z.array(ImportPeriodeSchema)
});

const EndringAarsakSykefravaerSchema = z.object({
  aarsak: z.literal('Sykefravaer'),
  sykefravaer: z.array(ImportPeriodeSchema)
});

const EndringAarsakTariffendringSchema = z.object({
  aarsak: z.literal('Tariffendring'),
  gjelderFra: z.coerce.date(),
  bleKjent: z.coerce.date()
});

const EndringAarsakVarigLoennsendringSchema = z.object({
  aarsak: z.literal('VarigLoennsendring'),
  gjelderFra: z.coerce.date()
});

export const ImportEndringAarsakSchema = z.discriminatedUnion(
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

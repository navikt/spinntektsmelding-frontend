import z from 'zod';
import forespoerselType from '../config/forespoerselType';

const beregningsmånedSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

const dateISODateSchema = z.string().date();

export type Opplysningstype = (typeof forespoerselType)[keyof typeof forespoerselType];

export const forrigeInntektSchema = z.object({
  skjæringstidspunkt: dateISODateSchema,
  kilde: z.enum(['INNTEKTSMELDING', 'AAREG']),
  beløp: z.number()
});

// Define ForespurtData schema
const forespurtDataSchema = z.object({
  paakrevd: z.boolean(),
  forslag: z
    .object({
      type: z.enum(['ForslagInntektFastsatt', 'ForslagInntektGrunnlag']),
      beregningsmaaneder: z.array(beregningsmånedSchema).optional(),
      forrigeInntekt: forrigeInntektSchema.optional(),
      opphoersdato: dateISODateSchema.nullable(),
      perioder: z.array(z.any()), // Replace with proper schema when available
      refundert: z.number().optional()
    })
    .optional()
});

// Schema for MottattForespurtData
const mottattForespurtDataSchema = z.record(
  z.string(), // Represents Opplysningstype values
  forespurtDataSchema
);

export type MottattForespurtData = z.infer<typeof mottattForespurtDataSchema>;
export type ForrigeInntekt = z.infer<typeof forrigeInntektSchema>;

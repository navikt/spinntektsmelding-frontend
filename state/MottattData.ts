import z from 'zod';
import forespoerselType from '../config/forespoerselType';

const beregningsmaanedSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

const dateISODateSchema = z.string().date();

export type Opplysningstype = (typeof forespoerselType)[keyof typeof forespoerselType];

const forrigeInntektSchema = z.object({
  skjæringstidspunkt: dateISODateSchema,
  kilde: z.enum(['INNTEKTSMELDING', 'AAREG']),
  beløp: z.number()
});

// Define ForespurtData schema
const forespurtDataSchema = z.object({
  paakrevd: z.boolean()
});

const forespurtInntektDataSchema = forespurtDataSchema.extend({
  forslag: z
    .object({
      type: z.enum(['ForslagInntektFastsatt', 'ForslagInntektGrunnlag']),
      forrigeInntekt: forrigeInntektSchema.optional(),
      beregningsmaaneder: z.array(beregningsmaanedSchema).optional()
    })
    .optional()
});

const forespurtRefusjonDataSchema = forespurtDataSchema.extend({
  paakrevd: z.boolean(),
  forslag: z
    .object({
      opphoersdato: dateISODateSchema.nullable(),
      perioder: z
        .array(
          z.object({
            fom: dateISODateSchema,
            beloep: z.number().optional()
          })
        )
        .optional(),
      refundert: z.number().optional()
    })
    .optional()
});

const forespurtArbeidsgiverperiodeDataSchema = forespurtDataSchema.extend({
  paakrevd: z.boolean()
});

export const mottattForespurtDataSchema = z.object({
  inntekt: forespurtInntektDataSchema,
  refusjon: forespurtRefusjonDataSchema,
  arbeidsgiverperiode: forespurtArbeidsgiverperiodeDataSchema
});

export type MottattForespurtData = z.infer<typeof mottattForespurtDataSchema>;
export type ForrigeInntekt = z.infer<typeof forrigeInntektSchema>;

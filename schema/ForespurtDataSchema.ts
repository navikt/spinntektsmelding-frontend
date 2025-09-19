import { z } from 'zod';
import forespoerselType from '../config/forespoerselType';

export const DateISODateSchema = z.iso.date();

export type TDateISODate = z.infer<typeof DateISODateSchema>;

export const MottattPeriodeSchema = z.object({
  fom: DateISODateSchema,
  tom: DateISODateSchema
});

export type MottattPeriode = z.infer<typeof MottattPeriodeSchema>;

const BeregningsmaanedSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

export type Opplysningstype = (typeof forespoerselType)[keyof typeof forespoerselType];

const ForrigeInntektSchema = z.object({
  skjæringstidspunkt: DateISODateSchema,
  kilde: z.enum(['INNTEKTSMELDING', 'AAREG']),
  beløp: z.number()
});

// Define ForespurtData schema
const ForespurtDataSchema = z.object({
  paakrevd: z.boolean()
});

const ForespurtInntektDataSchema = ForespurtDataSchema.extend({
  forslag: z
    .object({
      type: z.enum(['ForslagInntektFastsatt', 'ForslagInntektGrunnlag']),
      forrigeInntekt: ForrigeInntektSchema.optional(),
      beregningsmaaneder: z.array(BeregningsmaanedSchema).optional()
    })
    .optional()
});

const ForespurtRefusjonDataSchema = ForespurtDataSchema.extend({
  paakrevd: z.boolean(),
  forslag: z
    .object({
      opphoersdato: DateISODateSchema.nullable(),
      perioder: z
        .array(
          z.object({
            fom: DateISODateSchema,
            beloep: z.number().optional()
          })
        )
        .optional(),
      refundert: z.number().optional()
    })
    .optional()
});

const forespurtArbeidsgiverperiodeDataSchema = ForespurtDataSchema.extend({
  paakrevd: z.boolean()
});

export const MottattForespurtDataSchema = z.object({
  inntekt: ForespurtInntektDataSchema,
  refusjon: ForespurtRefusjonDataSchema,
  arbeidsgiverperiode: forespurtArbeidsgiverperiodeDataSchema
});

export type MottattForespurtData = z.infer<typeof MottattForespurtDataSchema>;
export type ForrigeInntekt = z.infer<typeof ForrigeInntektSchema>;

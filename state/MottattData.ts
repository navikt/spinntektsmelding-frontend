import z from 'zod';
import forespoerselType from '../config/forespoerselType';

export const dateISODateSchema = z.string().date();

const MottattPeriodeSchema = z.object({
  fom: dateISODateSchema,
  tom: dateISODateSchema
});

export type MottattPeriode = z.infer<typeof MottattPeriodeSchema>;

const MottattNaturalytelseSchema = z.object({
  type: z.string(),
  bortfallsdato: z.string().date(),
  verdi: z.number()
});

export type MottattNaturalytelse = z.infer<typeof MottattNaturalytelseSchema>;

const beregningsmaanedSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

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

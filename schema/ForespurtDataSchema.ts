import z from 'zod';
import forespoerselType from '../config/forespoerselType';

export const DateISODateSchema = z.iso.date();

export type TDateISODate = z.infer<typeof DateISODateSchema>;

export const MottattPeriodeSchema = z.object({
  fom: DateISODateSchema,
  tom: DateISODateSchema
});

export type MottattPeriode = z.infer<typeof MottattPeriodeSchema>;

export type Opplysningstype = (typeof forespoerselType)[keyof typeof forespoerselType];

const ForrigeInntektSchema = z.object({
  skjæringstidspunkt: DateISODateSchema,
  kilde: z.enum(['INNTEKTSMELDING', 'AAREG']),
  beløp: z.number()
});

const ForespurtDataSchema = z.object({
  paakrevd: z.boolean()
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
  inntekt: ForespurtDataSchema,
  refusjon: ForespurtRefusjonDataSchema,
  arbeidsgiverperiode: forespurtArbeidsgiverperiodeDataSchema
});

export type MottattForespurtData = z.infer<typeof MottattForespurtDataSchema>;
export type ForrigeInntekt = z.infer<typeof ForrigeInntektSchema>;

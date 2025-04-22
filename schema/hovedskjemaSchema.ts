import { z } from 'zod';
import { EndringAarsakSchema } from './endringAarsakSchema';
import { isTlfNumber } from '../utils/isTlfNumber';
import naturalytelserSchema from './naturalytelserSchema';

export const hovedskjemaSchema = z.object({
  bekreft_opplysninger: z.boolean().refine((value) => value === true, {
    message: 'Du må bekrefte at opplysningene er riktige før du kan sende inn.'
  }),
  inntekt: z.optional(
    z.object({
      beloep: z
        .number({
          required_error: 'Vennligst fyll inn beløpet for inntekt.',
          invalid_type_error: 'Vennligst angi bruttoinntekt på formatet 1234,50'
        })
        .min(0),
      endringAarsaker: z
        .array(EndringAarsakSchema.or(z.object({})))
        .superRefine((val, ctx) => {
          if (JSON.stringify(val) === JSON.stringify([{}])) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Vennligst angi årsak til endringen.',
              path: ['0', 'aarsak'],
              fatal: true
            });
            return z.NEVER;
          }
          const aarsaker = val.map((v) => v.aarsak);
          const uniqueAarsaker = new Set(aarsaker);
          if (aarsaker.length > 0 && uniqueAarsaker.size !== aarsaker.length) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Det kan ikke være flere like begrunnelser.',
              path: ['root'],
              fatal: true
            });
            return z.NEVER;
          }
          val.forEach((v, index) => {
            if (v.aarsak === '' || v.aarsak === undefined) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Vennligst angi årsak til endringen.',
                path: [index, 'aarsak'],
                fatal: true
              });
            }
          });

          return z.NEVER;
        })
        .or(z.null()),
      harBortfallAvNaturalytelser: z.boolean(),
      naturalytelser: z.array(naturalytelserSchema).optional()
    })
  ),
  avsenderTlf: z
    .string({
      invalid_type_error: 'Dette er ikke et telefonnummer'
    })
    .min(8, { message: 'Telefonnummeret er for kort, det må være 8 siffer' })
    .refine((val) => isTlfNumber(val), { message: 'Telefonnummeret er ikke gyldig' })
});

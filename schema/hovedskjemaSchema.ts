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
        .nullable(
          z.array(EndringAarsakSchema).refine(
            (val) => {
              const aarsaker = val.map((v) => v.aarsak);
              const uniqueAarsaker = new Set(aarsaker);
              return aarsaker.length > 0 && uniqueAarsaker.size === aarsaker.length;
            },
            {
              message: 'Det kan ikke være flere like begrunnelser'
            }
          )
        )
        .or(z.tuple([]))
        .or(z.undefined()),
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

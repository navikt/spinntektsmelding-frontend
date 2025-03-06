import { z } from 'zod';
import { EndringAarsakSchema } from './endringAarsakSchema';

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
      endringsaarsaker: z.nullable(z.array(EndringAarsakSchema))
    })
  )
});

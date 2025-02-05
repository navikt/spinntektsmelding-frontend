import { z } from 'zod';

export const PeriodeSchema = z
  .object({
    fom: z.date({
      required_error: 'Vennligst fyll inn fra dato',
      invalid_type_error: 'Dette er ikke en dato'
    }),
    tom: z.date({
      required_error: 'Vennligst fyll inn til dato',
      invalid_type_error: 'Dette er ikke en dato'
    })
  })
  .refine((val) => val.fom <= val.tom, { message: 'Fra dato må være før til dato', path: ['fom'] });

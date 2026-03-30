import { z } from 'zod';

export const ApiPeriodeSchema = z
  .object({
    fom: z.iso.date('Ugyldig fra dato'),
    tom: z.iso.date('Ugyldig til dato')
  })
  .refine((val) => !val.fom || !val.tom || val.fom <= val.tom, {
    error: 'Fra dato må være før til dato',
    path: ['fom']
  });

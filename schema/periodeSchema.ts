import { z } from 'zod';

export const PeriodeSchema = z.object({
  fom: z
    .string({
      required_error: 'Vennligst fyll inn fra dato',
      invalid_type_error: 'Dette er ikke en dato'
    })
    .date(),
  tom: z
    .string({
      required_error: 'Vennligst fyll inn til dato',
      invalid_type_error: 'Dette er ikke en dato'
    })
    .date()
});

import { z } from 'zod';

export const PeriodeSchema = z
  .object({
    fom: z.date({
      error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn fra dato' : 'Dette er ikke en dato')
    }),
    tom: z.date({
      error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn til dato' : 'Dette er ikke en dato')
    })
  })
  .refine((val) => val.fom <= val.tom, { error: 'Fra dato må være før til dato', path: ['fom'] });

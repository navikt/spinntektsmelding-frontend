import { z } from 'zod';
import { toLocalIso } from '../utils/toLocalIso';

export const PeriodeSchema = z
  .object({
    fom: z
      .date({
        error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn fra dato' : 'Dette er ikke en dato')
      })
      .transform((val) => toLocalIso(val)),
    tom: z
      .date({
        error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn til dato' : 'Dette er ikke en dato')
      })
      .transform((val) => toLocalIso(val))
  })
  .refine((val) => val.fom <= val.tom, { error: 'Fra dato må være før til dato', path: ['fom'] });

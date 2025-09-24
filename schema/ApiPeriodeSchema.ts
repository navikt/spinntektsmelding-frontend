import { isDate } from 'date-fns';
import { z } from 'zod/v4';

function isValidISODateString(dateString: string): boolean {
  if (!dateString) return false;
  if (dateString.length !== 10) return false;
  if (isNaN(Date.parse(dateString))) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && isDate(date);
}

export const ApiPeriodeSchema = z
  .object({
    fom: z
      .string({
        error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn fra dato' : 'Dette er ikke en dato')
      })
      .refine((val) => isValidISODateString(val), { error: 'Ugyldig dato' }),
    tom: z
      .string({
        error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn til dato' : 'Dette er ikke en dato')
      })
      .refine((val) => isValidISODateString(val), { error: 'Ugyldig dato' })
  })
  .refine((val) => !val.fom || !val.tom || val.fom <= val.tom, {
    error: 'Fra dato må være før til dato',
    path: ['fom']
  });

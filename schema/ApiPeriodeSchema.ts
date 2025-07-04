import { isDate } from 'date-fns';
import { z } from 'zod';

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
        required_error: 'Vennligst fyll inn fra dato',
        invalid_type_error: 'Dette er ikke en dato'
      })
      .refine((val) => isValidISODateString(val), { message: 'Ugyldig dato' }),
    tom: z
      .string({
        required_error: 'Vennligst fyll inn til dato',
        invalid_type_error: 'Dette er ikke en dato'
      })
      .refine((val) => isValidISODateString(val), { message: 'Ugyldig dato' })
  })
  .refine((val) => !val.fom || !val.tom || val.fom <= val.tom, {
    message: 'Fra dato må være før til dato',
    path: ['fom']
  });

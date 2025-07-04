import { isDate } from 'date-fns';
import { z } from 'zod';

export const ApiPeriodeSchema = z
  .object({
    fom: z
      .string({
        required_error: 'Vennligst fyll inn fra dato',
        invalid_type_error: 'Dette er ikke en dato'
      })
      .refine(
        (val) => {
          if (!val) return false;
          if (val.length < 10) return false;
          if (val.length > 10) return false;
          if (isNaN(Date.parse(val))) return false;
          if (!isDate(new Date(val))) return false;
          const date = new Date(val);
          return !isNaN(date.getTime());
        },
        { message: 'Ugyldig dato' }
      ),
    tom: z
      .string({
        required_error: 'Vennligst fyll inn til dato',
        invalid_type_error: 'Dette er ikke en dato'
      })
      .refine(
        (val) => {
          if (!val) return false;
          if (val.length < 10) return false;
          if (val.length > 10) return false;
          if (isNaN(Date.parse(val))) return false;
          if (!isDate(new Date(val))) return false;
          const date = new Date(val);
          return !isNaN(date.getTime());
        },
        { message: 'Ugyldig dato' }
      )
  })
  .refine((val) => !val.fom || !val.tom || val.fom <= val.tom, {
    message: 'Fra dato må være før til dato',
    path: ['fom']
  });

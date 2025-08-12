import { z } from 'zod/v4';
import isFnrNumber from '../utils/isFnrNumber';

export const PersonnummerSchema = z
  .string()
  .transform((val) => val.replace(/\s/g, ''))
  .pipe(
    z
      .string()
      .min(11, { error: 'Personnummeret er for kort, det må være 11 siffer' })
      .max(11, { error: 'Personnummeret er for langt, det må være 11 siffer' })
      .refine((val) => isFnrNumber(val), { error: 'Ugyldig personnummer' })
  );

import { z } from 'zod';
import isMod11Number from '../utils/isMod10Number';

export const OrganisasjonsnummerSchema = z
  .string()
  .transform((val) => val.replace(/\s/g, ''))
  .pipe(
    z
      .string({
        required_error: 'Organisasjon er ikke valgt'
      })
      .min(9, { message: 'Organisasjonsnummeret er for kort, det må være 9 siffer' })
      .max(9, { message: 'Organisasjonsnummeret er for langt, det må være 9 siffer' })
      .refine((val) => isMod11Number(val), { message: 'Velg arbeidsgiver' })
  );

import { z } from 'zod';
import isMod11Number from '../utils/isMod11Number';

export const OrganisasjonsnummerSchema = z
  .string()
  .transform((val) => val.replaceAll(/\s/g, ''))
  .pipe(
    z
      .string({
        message: 'Organisasjon er ikke valgt'
      })
      .min(9, { message: 'Organisasjonsnummeret er for kort, det må være 9 siffer' })
      .max(9, { message: 'Organisasjonsnummeret er for langt, det må være 9 siffer' })
      .refine((val) => isMod11Number(val), { message: 'Velg arbeidsgiver' })
  );

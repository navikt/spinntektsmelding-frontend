import { z } from 'zod';
import isMod11Number from '../utils/isMod10Number';

export const OrganisasjonsnummerSchema = z
  .string()
  .transform((val) => val.replace(/\s/g, ''))
  .pipe(
    z
      .string({
        error: (issue) => (issue.input === undefined ? 'Organisasjon er ikke valgt' : undefined)
      })
      .min(9, { error: 'Organisasjonsnummeret er for kort, det må være 9 siffer' })
      .max(9, { error: 'Organisasjonsnummeret er for langt, det må være 9 siffer' })
      .refine((val) => isMod11Number(val), { error: 'Velg arbeidsgiver' })
  );

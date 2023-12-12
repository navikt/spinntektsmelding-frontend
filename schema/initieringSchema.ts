import { z } from 'zod';
import isMod11Number from '../utils/isMod10Number';
import isFnrNumber from '../utils/isFnrNumber';

export default z.object({
  organisasjonsnummer: z
    .string()
    .transform((val) => val.replace(/\s/g, ''))
    .pipe(
      z
        .string()
        .min(9, { message: 'Organisasjonsnummeret er for kort, det må være 9 siffer' })
        .max(9, { message: 'Organisasjonsnummeret er for langt, det må være 9 siffer' })
    )
    .refine((val) => isMod11Number(val), { message: 'Velg arbeidsgiver', path: ['organisasjonsnummer'] }),
  navn: z.string().min(1),
  personnummer: z
    .string()
    .transform((val) => val.replace(/\s/g, ''))
    .pipe(
      z
        .string()
        .min(11, { message: 'Personnummeret er for kort, det må være 11 siffer' })
        .max(11, { message: 'Personnummeret er for langt, det må være 11 siffer' })
    )
    .refine((val) => isFnrNumber(val), { message: 'Ugyldig personnummer', path: ['identitetsnummer'] })
});

import { z } from 'zod';
import { apiPeriodeSchema } from './apiPeriodeSchema';
import feiltekster from '../utils/feiltekster';

export const PeriodeListeSchema = z.array(apiPeriodeSchema).superRefine((val, ctx) => {
  for (let i = 0; i < val.length - 1; i++) {
    const tom = new Date(val[i].tom);
    const fom = new Date(val[i + 1].fom);
    const forskjellMs = Number(tom) - Number(fom);
    const forskjellDager = Math.abs(Math.floor(forskjellMs / 1000 / 60 / 60 / 24));
    if (forskjellDager > 16) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: feiltekster.FOR_MANGE_DAGER_MELLOM,
        path: [i.toString(), 'tom']
      });
    }
  }
});

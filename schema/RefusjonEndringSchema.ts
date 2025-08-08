import { z } from 'zod/v4';
import { toLocalIso } from '../utils/toLocalIso';

export const RefusjonEndringSchema = z.object({
  startdato: z
    .date({
      error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn dato for endring i refusjon' : undefined)
    })
    .transform((val) => toLocalIso(val)),
  beloep: z
    .number({
      error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn beløpet for endret refusjon.' : undefined)
    })
    .min(0, { error: 'Beløpet må være større enn eller lik 0' })
});

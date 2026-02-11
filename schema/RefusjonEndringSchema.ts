import { z } from 'zod';
// import { toLocalIso } from '../utils/toLocalIso';

export const RefusjonEndringSchema = z.object({
  startdato: z.date({
    error: (issue) =>
      issue.input === undefined ? 'Vennligst fyll inn gyldig dato for endring av refusjon.' : undefined
  }),
  // .transform((val) => toLocalIso(val)),
  beloep: z.number({ error: 'Vennligst fyll inn beløpet for endret refusjon.' }).min(0)
});

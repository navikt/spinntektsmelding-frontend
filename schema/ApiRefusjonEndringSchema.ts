import { z } from 'zod';

export const RefusjonEndringSchema = z.object({
  startdato: z.date('Vennligst fyll inn gyldig dato for endring i refusjon.'),
  beloep: z
    .number({
      error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn beløpet for endret refusjon.' : undefined)
    })
    .min(0, { error: 'Beløpet må være større enn eller lik 0' })
});

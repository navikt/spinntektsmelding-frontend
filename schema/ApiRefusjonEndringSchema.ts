import { z } from 'zod/v4';

export const RefusjonEndringSchema = z.object({
  startdato: z.iso.date({
    error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn dato for endring i refusjon' : undefined)
  }),
  beloep: z
    .number({
      error: (issue) => (issue.input === undefined ? 'Vennligst fyll inn beløpet for endret refusjon.' : undefined)
    })
    .min(0, { error: 'Beløpet må være større enn eller lik 0' })
});

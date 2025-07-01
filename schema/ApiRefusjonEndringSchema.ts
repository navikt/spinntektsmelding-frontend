import { z } from 'zod';

export const RefusjonEndringSchema = z.object({
  startdato: z.string({ required_error: 'Vennligst fyll inn dato for endring i refusjon' }).date('Dato er ikke gyldig'),
  beloep: z
    .number({ required_error: 'Vennligst fyll inn beløpet for endret refusjon.' })
    .min(0, { message: 'Beløpet må være større enn eller lik 0' })
});

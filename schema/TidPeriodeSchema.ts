import { z } from 'zod/v4';

export const TidPeriodeSchema = z.object({
  fom: z.date().optional(),
  tom: z.date().optional()
});

export type TidPeriode = z.infer<typeof TidPeriodeSchema>;

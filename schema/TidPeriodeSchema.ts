import { z } from 'zod/v4';

const TidPeriodeSchema = z.object({
  fom: z.date().optional(),
  tom: z.date().optional()
});

export type TidPeriode = z.infer<typeof TidPeriodeSchema>;

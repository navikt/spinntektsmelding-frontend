import { z } from 'zod';

const tidPeriodeSchema = z.object({
  fom: z.date().optional(),
  tom: z.date().optional()
});

export type TidPeriodeSchema = z.infer<typeof tidPeriodeSchema>;

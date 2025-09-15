import { z } from 'zod';
import { PersonnummerSchema } from './PersonnummerSchema';

export const SykmeldtSchema = z.object({
  navn: z.string().min(1),
  fnr: PersonnummerSchema
});

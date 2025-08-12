import z from 'zod/v4';
import { PersonnummerSchema } from './PersonnummerSchema';

export const SykmeldtSchema = z.object({
  navn: z.string().min(1),
  fnr: PersonnummerSchema
});

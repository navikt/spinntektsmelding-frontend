import z from 'zod';
import { PersonnummerSchema } from './personnummerSchema';

export const sykmeldtSchema = z.object({
  navn: z.string().min(1),
  fnr: PersonnummerSchema
});

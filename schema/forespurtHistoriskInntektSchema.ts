import z from 'zod';
import { historiskInntektSchema } from './historiskInntektSchema';

export const forespurtHistoriskInntektSchema = z.object({
  gjennomsnitt: z.number(),
  historikk: historiskInntektSchema
});

import z from 'zod/v4';
import { HistoriskInntektSchema } from './HistoriskInntektSchema';

export const ForespurtHistoriskInntektSchema = z.object({
  gjennomsnitt: z.number(),
  historikk: HistoriskInntektSchema
});
